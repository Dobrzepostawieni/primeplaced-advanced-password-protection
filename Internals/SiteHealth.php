<?php
/**
 * Site Health Integration.
 *
 * Adds detailed diagnostic information about the plugin to the WordPress Site Health screen.
 *
 * @package    PPADVP
 * @author     Dobrzepostawieni <contact@dobrzepostawieni.pl>
 * @copyright  2026
 * @license    GPL-3.0-or-later
 */

namespace PPADVP\Internals;

// Prevent direct file access.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

use PPADVP\Engine\Base;
use PPADVP\Services\Options;

/**
 * Class SiteHealth
 *
 * @phpstan-type HealthField array{label: string, value: string|int, order?: int}
 */
class SiteHealth extends Base {

	/**
	 * Initialize the class and register hooks.
	 */
	public function initialize(): bool {
		if ( ! parent::initialize() ) {
			return false;
		}

		\add_filter( 'debug_information', array( $this, 'add_debug_info' ) );

		return true;
	}

	/**
	 * Adds plugin-specific information to the Site Health debug tab.
	 *
	 * @param array<string, array<string, mixed>> $info Existing debug information.
	 * @return array<string, array<string, mixed>> Modified debug information.
	 */
	public function add_debug_info( array $info ): array {
		$settings = Options::get_raw();

		$info['advanced_password_protection'] = array(
			'label'       => \__( 'PrimePlaced - Password Protect Site & Staging', 'primeplaced-advanced-password-protection' ),
			'description' => \__( 'Detailed configuration and protection status for support purposes.', 'primeplaced-advanced-password-protection' ),
			'fields'      => $this->prepare_debug_fields( $settings ),
		);

		return $info;
	}

	/**
	 * Prepares, filters, and sorts the array of fields for the Site Health report.
	 *
	 * @param array<string, mixed> $settings Plugin settings.
	 * @return array<string, array{label: string, value: string|int}>
	 */
	private function prepare_debug_fields( array $settings ): array {
		$core_fields = \array_merge(
			$this->get_system_fields(),
			$this->get_environment_fields(),
			$this->get_protection_fields( $settings ),
			$this->get_design_fields( $settings )
		);

		/**
		 * Allows extensions to inject and sort their own Site Health fields.
		 *
		 * @param array<string, HealthField> $core_fields Existing fields with 'order' key.
		 * @param array<string, mixed>       $settings    Raw plugin settings.
		 */
		$fields = (array) \apply_filters( 'ppadvp_site_health_fields', $core_fields, $settings );

		\uasort(
			$fields,
			fn( $a, $b ) => ( (int) ( $a['order'] ?? 1000 ) ) <=> ( (int) ( $b['order'] ?? 1000 ) )
		);

		$cleaned = array();
		foreach ( $fields as $key => $field ) {
			if ( \is_array( $field ) ) {
				unset( $field['order'] );
				$cleaned[ $key ] = $field;
			}
		}

		return $cleaned;
	}

	/**
	 * Returns system and version related fields (Technical section).
	 *
	 * @return array<string, HealthField>
	 */
	private function get_system_fields(): array {
		return array(
			'version'         => array(
				'label' => \__( 'Plugin Version', 'primeplaced-advanced-password-protection' ),
				'value' => \defined( 'PPADVP_VERSION' ) ? (string) \PPADVP_VERSION : '1.0.0',
				'order' => 10,
			),
			'php_requirement' => array(
				'label' => \__( 'PHP Requirement', 'primeplaced-advanced-password-protection' ),
				'value' => \defined( 'PPADVP_MIN_PHP_VERSION' ) ? (string) \PPADVP_MIN_PHP_VERSION : '7.4',
				'order' => 130,
			),
			'wp_requirement'  => array(
				'label' => \__( 'WP Requirement', 'primeplaced-advanced-password-protection' ),
				'value' => \defined( 'PPADVP_WP_VERSION' ) ? (string) \PPADVP_WP_VERSION : '6.2',
				'order' => 140,
			),
		);
	}

	/**
	 * Returns environment and security related fields (Technical section).
	 *
	 * @return array<string, HealthField>
	 */
	private function get_environment_fields(): array {
		$memory_limit = \ini_get( 'memory_limit' );
		$permalinks   = \get_option( 'permalink_structure' );
		$server       = isset( $_SERVER['SERVER_SOFTWARE'] ) ? (string) \sanitize_text_field( \wp_unslash( $_SERVER['SERVER_SOFTWARE'] ) ) : \__( 'Unknown', 'primeplaced-advanced-password-protection' );

		return array(
			'server_software'  => array(
				'label' => \__( 'Server Software', 'primeplaced-advanced-password-protection' ),
				'value' => $server,
				'order' => 145,
			),
			'php_memory_limit' => array(
				'label' => \__( 'PHP Memory Limit', 'primeplaced-advanced-password-protection' ),
				'value' => \is_string( $memory_limit ) && '' !== $memory_limit ? $memory_limit : \__( 'Unknown', 'primeplaced-advanced-password-protection' ),
				'order' => 150,
			),
			'wp_debug'         => array(
				'label' => \__( 'WP Debug', 'primeplaced-advanced-password-protection' ),
				'value' => \defined( 'WP_DEBUG' ) && \WP_DEBUG ? \__( 'Enabled', 'primeplaced-advanced-password-protection' ) : \__( 'Disabled', 'primeplaced-advanced-password-protection' ),
				'order' => 155,
			),
			'cookie_domain'    => array(
				'label' => \__( 'Cookie Domain', 'primeplaced-advanced-password-protection' ),
				'value' => \defined( 'COOKIE_DOMAIN' ) && \COOKIE_DOMAIN ? (string) \constant( 'COOKIE_DOMAIN' ) : \__( 'Not set', 'primeplaced-advanced-password-protection' ),
				'order' => 160,
			),
			'ssl_status'       => array(
				'label' => \__( 'SSL Status', 'primeplaced-advanced-password-protection' ),
				'value' => \is_ssl() ? \__( 'Active', 'primeplaced-advanced-password-protection' ) : \__( 'Inactive', 'primeplaced-advanced-password-protection' ),
				'order' => 170,
			),
			'permalinks'       => array(
				'label' => \__( 'Permalink Structure', 'primeplaced-advanced-password-protection' ),
				'value' => empty( $permalinks ) ? \__( 'Plain (Default)', 'primeplaced-advanced-password-protection' ) : (string) $permalinks,
				'order' => 175,
			),
			'active_cache'     => array(
				'label' => \__( 'Active Cache Plugins', 'primeplaced-advanced-password-protection' ),
				'value' => $this->detect_cache_plugins(),
				'order' => 180,
			),
			'security_plugins' => array(
				'label' => \__( 'Security Plugins', 'primeplaced-advanced-password-protection' ),
				'value' => $this->detect_security_plugins(),
				'order' => 190,
			),
		);
	}

	/**
	 * Returns protection and password related fields (Free section).
	 *
	 * @param array<string, mixed> $settings Settings.
	 * @return array<string, HealthField>
	 */
	private function get_protection_fields( array $settings ): array {
		$cookie_type = (string) ( $settings['cookie_type'] ?? 'duration' );
		$cookie_days = (int) ( $settings['cookie_days'] ?? 7 );

		$cookie_val = ( 'duration' === $cookie_type )
			/* translators: %d: number of days */
			? \sprintf( \__( '%d days', 'primeplaced-advanced-password-protection' ), $cookie_days )
			: $cookie_type;

		return array(
			'global_lock'      => array(
				'label' => \__( 'Global Site Lock', 'primeplaced-advanced-password-protection' ),
				'value' => ! empty( $settings['protection'] ) ? \__( 'Enabled', 'primeplaced-advanced-password-protection' ) : \__( 'Disabled', 'primeplaced-advanced-password-protection' ),
				'order' => 10,
			),
			'passwords_count'  => array(
				'label' => \__( 'Registered Passwords', 'primeplaced-advanced-password-protection' ),
				'value' => ! empty( $settings['password']['password'] ) ? 1 : 0,
				'order' => 20,
			),
			'cookie_lifecycle' => array(
				'label' => \__( 'Cookie Lifecycle', 'primeplaced-advanced-password-protection' ),
				'value' => $cookie_val,
				'order' => 30,
			),
		);
	}

	/**
	 * Returns design fields (Free section).
	 *
	 * @param array<string, mixed> $settings Settings.
	 * @return array<string, HealthField>
	 */
	private function get_design_fields( array $settings ): array {
		$design   = (array) ( $settings['design_settings'] ?? array() );
		$has_logo = ! empty( $design['logoId'] );

		return array(
			'custom_branding' => array(
				'label' => \__( 'Custom Branding', 'primeplaced-advanced-password-protection' ),
				'value' => $has_logo ? \__( 'Yes', 'primeplaced-advanced-password-protection' ) : \__( 'No', 'primeplaced-advanced-password-protection' ),
				'order' => 40,
			),
		);
	}

	/**
	 * Detects caching mechanisms and plugins dynamically.
	 *
	 * @return string Comma-separated list or a default message.
	 */
	private function detect_cache_plugins(): string {
		$keywords = array( 'cache', 'optimize', 'speed', 'performance', 'rocket', 'litespeed', 'fast', 'minify', 'cloudflare' );
		$plugins  = $this->detect_plugins_by_keywords( $keywords );
		$status   = array();

		if ( \defined( 'WP_CACHE' ) && \WP_CACHE ) {
			$status[] = 'WP_CACHE Drop-in';
		}

		if ( '' !== $plugins ) {
			$status[] = $plugins;
		}

		return empty( $status ) ? \__( 'None detected', 'primeplaced-advanced-password-protection' ) : \implode( ', ', $status );
	}

	/**
	 * Detects popular security plugins dynamically.
	 *
	 * @return string Comma-separated list or a default message.
	 */
	private function detect_security_plugins(): string {
		$keywords = array( 'security', 'firewall', 'malware', 'protect', 'defender', 'wordfence', 'sucuri', 'login', 'limit attempts' );
		$plugins  = $this->detect_plugins_by_keywords( $keywords );

		return '' !== $plugins ? $plugins : \__( 'None detected', 'primeplaced-advanced-password-protection' );
	}

	/**
	 * Dynamically searches active plugins for specific keywords.
	 * Excludes the current plugin to prevent self-detection.
	 *
	 * @param array<int, string> $keywords List of keywords to look for.
	 * @return string Comma-separated list of matched plugin names.
	 */
	private function detect_plugins_by_keywords( array $keywords ): string {
		$detected = array();

		if ( ! \function_exists( 'get_plugins' ) ) {
			require_once ABSPATH . 'wp-admin/includes/plugin.php';
		}

		$active_plugins = (array) \get_option( 'active_plugins', array() );

		if ( \is_multisite() ) {
			$sitewide       = (array) \get_site_option( 'active_sitewide_plugins', array() );
			$active_plugins = \array_merge( $active_plugins, \array_keys( $sitewide ) );
		}

		$all_plugins = \get_plugins();
		$this_plugin = \plugin_basename( \PPADVP_PLUGIN_ABSOLUTE );

		foreach ( $active_plugins as $plugin_file ) {

			if ( $plugin_file === $this_plugin ) {
				continue;
			}

			if ( isset( $all_plugins[ $plugin_file ] ) ) {
				$plugin_name  = (string) $all_plugins[ $plugin_file ]['Name'];
				$check_string = \strtolower( $plugin_name . ' ' . $plugin_file );

				foreach ( $keywords as $keyword ) {
					if ( false !== \strpos( $check_string, $keyword ) ) {
						$detected[] = $plugin_name;
						break;
					}
				}
			}
		}

		return empty( $detected ) ? '' : \implode( ', ', \array_unique( $detected ) );
	}
}
