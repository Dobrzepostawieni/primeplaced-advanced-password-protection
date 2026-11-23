<?php

/**
 * Dependency Injection Container.
 *
 * Automatically resolves class dependencies using Reflection and manages
 * shared instances throughout the plugin lifecycle.
 *
 * @package   PPADVP
 * @author    Dobrzepostawieni <contact@dobrzepostawieni.pl>
 * @copyright 2026 Dobrzepostawieni.pl
 * @license   GPL-3.0-or-later
 */
namespace PPADVP\Engine;

// Prevent direct file access.
if ( !defined( 'ABSPATH' ) ) {
    exit;
}
use PPADVP\Services\Interfaces\AuthCookieStrategy;
use PPADVP\Services\CookieStrategy;
use PPADVP\Services\SecurityProvider;
use PPADVP\Services\SessionManager;
use PPADVP\Services\RateLimiter;
use PPADVP\Frontend\AccessGuard;
use PPADVP\Rest\PasswordCheckController;
use ReflectionClass;
use ReflectionNamedType;
use ReflectionParameter;
use ReflectionMethod;
use ReflectionException;
/**
 * Class Container
 */
class Container {
    /**
     * Registry for shared singletons.
     *
     * @var array<string, object>
     */
    private array $instances = array();

    /**
     * Retrieves a shared instance of a requested class.
     *
     * Returns an existing instance if available; otherwise, creates
     * a new one through the resolution engine.
     *
     * @param string $class_name Full namespace of the class.
     */
    public function get( string $class_name ) : object {
        if ( isset( $this->instances[$class_name] ) ) {
            return $this->instances[$class_name];
        }
        $instance = $this->resolve_dependency( $class_name );
        $this->instances[$class_name] = $instance;
        return $instance;
    }

    /**
     * Resolves dependencies via manual maps or auto-wiring.
     *
     * @param string $class_name Target class.
     */
    private function resolve_dependency( string $class_name ) : object {
        $manual_maps = $this->get_manual_maps();
        if ( isset( $manual_maps[$class_name] ) ) {
            return $manual_maps[$class_name]( $this );
        }
        return $this->auto_wire( $class_name );
    }

    /**
     * Provides a map for classes requiring custom instantiation logic.
     *
     * @return array<string, callable>
     */
    private function get_manual_maps() : array {
        return array(
            AccessGuard::class             => function ( self $container ) : AccessGuard {
                $security = $container->get( SecurityProvider::class );
                $session = $container->get( SessionManager::class );
                if ( !$security instanceof SecurityProvider || !$session instanceof SessionManager ) {
                    return new AccessGuard(new SecurityProvider(), $container->get_cookie_strategy(), new SessionManager());
                }
                return new AccessGuard($security, $container->get_cookie_strategy(), $session);
            },
            PasswordCheckController::class => function ( self $container ) : PasswordCheckController {
                $security = $container->get( SecurityProvider::class );
                $limiter = $container->get( RateLimiter::class );
                $session = $container->get( SessionManager::class );
                if ( !$security instanceof SecurityProvider || !$limiter instanceof RateLimiter || !$session instanceof SessionManager ) {
                    return new PasswordCheckController(
                        new SecurityProvider(),
                        new RateLimiter(),
                        $container->get_cookie_strategy(),
                        new SessionManager()
                    );
                }
                return new PasswordCheckController(
                    $security,
                    $limiter,
                    $container->get_cookie_strategy(),
                    $session
                );
            },
        );
    }

    /**
     * Uses Reflection to automatically satisfy constructor requirements.
     *
     * @param string $class_name Class to instantiate.
     * @throws \Exception If class does not exist or is not instantiable.
     */
    private function auto_wire( string $class_name ) : object {
        if ( !\class_exists( $class_name ) ) {
            throw new \Exception(esc_html( "Class {$class_name} does not exist and cannot be instantiated." ));
        }
        try {
            $reflection_class = new ReflectionClass($class_name);
            if ( !$reflection_class->isInstantiable() ) {
                throw new \Exception(esc_html( "Class {$class_name} is not instantiable (it might be an interface or abstract class)." ));
            }
            $constructor = $reflection_class->getConstructor();
            if ( null === $constructor ) {
                return new $class_name();
            }
            $dependencies = $this->resolve_constructor_args( $constructor );
            return $reflection_class->newInstanceArgs( $dependencies );
        } catch ( ReflectionException $exception ) {
            \do_action( 'ppadvp_container_auto_wire_failed', $exception, $class_name );
            throw new \Exception(esc_html( "Reflection failed to auto-wire class {$class_name}." ));
        }
    }

    /**
     * Iterates through parameters to build an argument list.
     *
     * @param ReflectionMethod $reflection_method Reflection of the constructor.
     *
     * @return array<int, mixed>
     */
    private function resolve_constructor_args( ReflectionMethod $reflection_method ) : array {
        $parameters = $reflection_method->getParameters();
        $resolved = array();
        foreach ( $parameters as $parameter ) {
            $resolved[] = $this->resolve_single_parameter( $parameter );
        }
        return $resolved;
    }

    /**
     * Resolves an individual parameter as a service or primitive.
     *
     * @param ReflectionParameter $reflection_parameter Parameter reflection.
     *
     * @return mixed
     */
    private function resolve_single_parameter( ReflectionParameter $reflection_parameter ) {
        $type = $reflection_parameter->getType();
        if ( $type instanceof ReflectionNamedType && !$type->isBuiltin() ) {
            return $this->get( $type->getName() );
        }
        if ( $reflection_parameter->isDefaultValueAvailable() ) {
            try {
                return $reflection_parameter->getDefaultValue();
            } catch ( ReflectionException $exception ) {
                \do_action( 'ppadvp_container_param_resolve_failed', $exception );
            }
        }
        return null;
    }

    /**
     * Switches between Free and Pro Cookie Strategies based on license status.
     */
    public function get_cookie_strategy() : AuthCookieStrategy {
        if ( isset( $this->instances[AuthCookieStrategy::class] ) ) {
            $instance = $this->instances[AuthCookieStrategy::class];
            if ( $instance instanceof AuthCookieStrategy ) {
                return $instance;
            }
        }
        $strategy = new CookieStrategy();
        $this->instances[AuthCookieStrategy::class] = $strategy;
        return $strategy;
    }

}
