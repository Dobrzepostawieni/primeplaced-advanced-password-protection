<?php

/**
 * PPADVP
 *
 * @package    PPADVP
 * @author     Dobrzepostawieni <contact@dobrzepostawieni.pl>
 * @copyright  2026 Dobrzepostawieni.pl
 * @license   GPL-3.0-or-later
 * @link       http://dobrzepostawieni.pl
 */
namespace PPADVP\Engine;

// Prevent direct file access.
if ( !defined( 'ABSPATH' ) ) {
    exit;
}
use Composer\Autoload\ClassLoader;
use ReflectionClass;
use RecursiveDirectoryIterator;
use RecursiveIteratorIterator;
use FilesystemIterator;
use SplFileInfo;
use Throwable;
use Exception;
/**
 * PPADVP Initializer
 */
class Initializer {
    /**
     * List of class to Initializer.
     *
     * @var array<string>
     */
    public array $classes = array();

    /**
     * Instance of this Context.
     */
    protected Context $context;

    /**
     * Composer autoload file list.
     */
    private ClassLoader $class_loader;

    /**
     * Dependency Injection Container.
     */
    private Container $container;

    /**
     * The Constructor that load the entry classes
     *
     * @param ClassLoader $class_loader Composer autoload output.
     */
    public function __construct( ClassLoader $class_loader ) {
        $this->context = new Context();
        $this->class_loader = $class_loader;
        $this->container = new Container();
        $this->register_core_namespaces();
        $this->register_request_namespaces();
        $this->load_classes();
    }

    /**
     * Registers core namespaces.
     */
    private function register_core_namespaces() : void {
        $this->get_classes( 'Engine' );
        $this->get_classes( 'Services' );
        $this->get_classes( 'Integrations' );
        $this->get_classes( 'Internals' );
    }

    /**
     * Registers namespaces based on request type.
     */
    private function register_request_namespaces() : void {
        if ( $this->context->request( 'rest' ) ) {
            $this->get_classes( 'Rest' );
            $this->classes[] = \PPADVP\Frontend\AccessGuard::class;
        }
        if ( $this->context->request( 'backend' ) ) {
            $this->get_classes( 'Backend' );
        }
        if ( !$this->context->request( 'frontend' ) ) {
            return;
        }
        $this->get_classes( 'Frontend' );
    }

    /**
     * Initialize all the classes.
     *
     * @throws Exception When a class fails to initialize.
     */
    private function load_classes() : void {
        $this->classes = (array) \apply_filters( 'ppadvp_classes_to_execute', $this->classes );
        foreach ( $this->classes as $class ) {
            try {
                $this->initialize_plugin_class( (string) $class );
            } catch ( Throwable $err ) {
                \do_action( 'ppadvp_initialize_failed', $err );
                if ( \defined( 'WP_DEBUG' ) && WP_DEBUG ) {
                    // phpcs:ignore WordPress.Security.EscapeOutput.ExceptionNotEscaped
                    throw new Exception(\esc_html( $err->getMessage() ), (int) $err->getCode(), $err);
                }
            }
        }
    }

    /**
     * Validate the class and initialize it using DI Container.
     *
     * @param string $class_to_validate Class name to validate.
     */
    private function initialize_plugin_class( string $class_to_validate ) : void {
        if ( self::class === $class_to_validate || !\class_exists( $class_to_validate ) ) {
            return;
        }
        $reflection_class = new ReflectionClass($class_to_validate);
        if ( !$this->should_initialize_class( $reflection_class ) ) {
            return;
        }
        if ( false !== \mb_strpos( $class_to_validate, 'Widgets' ) ) {
            $this->initialize_widget( $class_to_validate );
            return;
        }
        $this->initialize_instance( $class_to_validate );
    }

    /**
     * Checks if a class meets the requirements for initialization.
     *
     * @param ReflectionClass $reflection_class The reflection object.
     * @phpstan-param ReflectionClass<object> $reflection_class
     */
    private function should_initialize_class( ReflectionClass $reflection_class ) : bool {
        return $reflection_class->isInstantiable() && !$reflection_class->isAbstract() && !$reflection_class->isInterface() && !$reflection_class->isTrait();
    }

    /**
     * Handles widget initialization via hook.
     *
     * @param string $class_name Class name.
     */
    private function initialize_widget( string $class_name ) : void {
        \add_action( 'widgets_init', function () use($class_name) : void {
            $this->initialize_instance( $class_name );
        } );
    }

    /**
     * Instantiates and initializes a standard class using Container.
     *
     * @param string $class_name Class name.
     */
    private function initialize_instance( string $class_name ) : void {
        $instance = $this->container->get( $class_name );
        if ( !\method_exists( $instance, 'initialize' ) ) {
            return;
        }
        $instance->initialize();
    }

    /**
     * Based on the folder loads the classes automatically using the Composer autoload.
     *
     * @param string $namespace_to_find Class name to find.
     * @return array<string> Return the classes.
     */
    private function get_classes( string $namespace_to_find ) : array {
        $classmap = $this->class_loader->getClassMap();
        $search = 'PPADVP\\' . $namespace_to_find;
        if ( isset( $classmap[self::class] ) ) {
            $previous_count = \count( $this->classes );
            $this->extract_from_classmap( $classmap, $search . '\\' );
            if ( $previous_count < \count( $this->classes ) ) {
                return $this->classes;
            }
        }
        $prefixes = $this->class_loader->getPrefixesPsr4();
        $search .= '\\';
        if ( isset( $prefixes[$search] ) ) {
            $folder = (string) $prefixes[$search][0];
            $this->scan_psr4_directory( $folder, $search );
        }
        return $this->classes;
    }

    /**
     * Extracts classes matching the namespace from the authoritative classmap.
     *
     * @param array<string, string> $classmap Composer class map.
     * @param string                $search   Base namespace to search.
     */
    private function extract_from_classmap( array $classmap, string $search ) : void {
        foreach ( \array_keys( $classmap ) as $class ) {
            if ( 0 === \strncmp( (string) $class, $search, \strlen( $search ) ) ) {
                $this->classes[] = (string) $class;
            }
        }
    }

    /**
     * Scans the filesystem for classes as a fallback mechanism using SPL iterators.
     *
     * @param string $folder         The absolute path to scan.
     * @param string $base_namespace The namespace prefix.
     */
    private function scan_psr4_directory( string $folder, string $base_namespace ) : void {
        if ( !\is_dir( $folder ) ) {
            return;
        }
        $directory = new RecursiveDirectoryIterator($folder, FilesystemIterator::SKIP_DOTS);
        $iterator = new RecursiveIteratorIterator($directory);
        $normalized_folder = \str_replace( '\\', '/', $folder );
        foreach ( $iterator as $file ) {
            if ( !$file instanceof SplFileInfo || 'php' !== $file->getExtension() ) {
                continue;
            }
            $normalized_file = \str_replace( '\\', '/', $file->getPathname() );
            $relative_path = \str_replace( $normalized_folder . '/', '', $normalized_file );
            if ( $this->has_lowercase_only_parts( $relative_path ) ) {
                continue;
            }
            $class_path = \str_replace( '/', '\\', $relative_path );
            $class_name = \substr( (string) $class_path, 0, -4 );
            $this->classes[] = $base_namespace . $class_name;
        }
    }

    /**
     * Checks if any part of the path is strictly lowercase.
     * PSR-4 dictates that classes and their namespaces start with an uppercase letter.
     *
     * @param string $path The relative path.
     * @return bool True if it contains purely lowercase segments.
     */
    private function has_lowercase_only_parts( string $path ) : bool {
        $parts = \explode( '/', $path );
        foreach ( $parts as $part ) {
            $name = \str_replace( '.php', '', $part );
            if ( \strtolower( $name ) === $name ) {
                return true;
            }
        }
        return false;
    }

}
