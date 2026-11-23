<?php
/**
 * Core Options Helper Class.
 *
 * @package    PPADVP
 * @author     Dobrzepostawieni <contact@dobrzepostawieni.pl>
 * @copyright  2026 Dobrzepostawieni.pl
 * @license    GPL-3.0-or-later
 */

namespace PPADVP\Services;

// Prevent direct file access.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

use PPADVP\Services\Abstracts\AbstractOptions;
use WP_Error;

/**
 * Class Options
 */
class Options extends AbstractOptions {

	/**
	 * Cache for design defaults.
	 *
	 * @var array<string, mixed>|null
	 */
	private static ?array $design_defaults = null;

	/**
	 * Returns the database option name.
	 *
	 * @return string Option key.
	 */
	public static function get_option_name(): string {
		return 'ppadvp_settings';
	}

	/**
	 * Returns the default settings structure.
	 *
	 * @return array<string, mixed> Default settings.
	 */
	public static function get_defaults(): array {
		return array(
			'protection'      => false,
			'password'        => null,
			'design_settings' => self::get_design_defaults(),
			'cookie_type'     => 'duration',
			'cookie_days'     => 7,
			'session_salt'    => '',
		);
	}

	/**
	 * Retrieves raw settings and omits the obsolete empty passwords field
	 * left in wp_options by version 1.0.0.
	 *
	 * The singular password field and all other stored values are preserved
	 * exactly as they exist in the database. No sanitization, encryption or
	 * database write is performed during this read.
	 *
	 * @return array<string, mixed> Full raw settings merged with defaults.
	 */
	public static function get_raw(): array {
		$defaults = self::get_defaults();
		$settings = \get_option( self::get_option_name(), array() );

		if ( ! \is_array( $settings ) ) {
			$settings = array();
		}

		$settings = self::remove_obsolete_empty_passwords_field( $settings );

		return \array_replace_recursive( $defaults, $settings );
	}

	/**
	 * Fetches a specific value from the nested design settings.
	 *
	 * @param string $key Design configuration key.
	 * @return mixed Design value or null.
	 */
	public static function get_design( string $key ) {
		$settings = self::get_all();
		$design   = (array) ( $settings['design_settings'] ?? array() );

		return $design[ $key ] ?? null;
	}

	/**
	 * Prepares incoming settings for database storage.
	 *
	 * @param array<string, mixed>      $params           Incoming settings.
	 * @param array<string, mixed>|null $current_settings Existing settings, or null to load current settings.
	 * @return array<string, mixed> Settings ready for update_option().
	 */
	public static function prepare_for_storage( array $params, ?array $current_settings = null ): array {
		$sanitized_params = Sanitizer::sanitize_general_options( $params );
		$settings         = \is_array( $current_settings ) ? $current_settings : self::get_raw();
		$allowed_keys     = self::get_storage_keys();

		foreach ( $sanitized_params as $key => $value ) {
			if ( \in_array( $key, $allowed_keys, true ) ) {
				$settings[ $key ] = $value;
			}
		}

		self::ensure_session_salt( $settings );
		self::encrypt_password_for_storage( $settings );

		return $settings;
	}

	/**
	 * Validates settings invariants before storage.
	 *
	 * @param array<string, mixed> $settings Settings prepared for storage.
	 * @return true|WP_Error True when valid, otherwise an error.
	 */
	public static function validate_for_storage( array $settings ) {
		if ( ! empty( $settings['protection'] ) && ! self::has_active_password( $settings ) ) {
			return new WP_Error(
				'ppadvp_missing_active_password',
				\__( 'Protection cannot be enabled without an active password.', 'primeplaced-advanced-password-protection' ),
				array( 'status' => 400 )
			);
		}

		return true;
	}

	/**
	 * Persists incoming settings after shared sanitization and validation.
	 *
	 * @param array<string, mixed>      $params           Incoming settings.
	 * @param array<string, mixed>|null $current_settings Existing settings, or null to load current settings.
	 * @return bool|WP_Error True/false from update_option(), or an error when validation fails.
	 */
	public static function persist( array $params, ?array $current_settings = null ) {
		$settings   = self::prepare_for_storage( $params, $current_settings );
		$validation = self::validate_for_storage( $settings );

		if ( \is_wp_error( $validation ) ) {
			return $validation;
		}

		return \update_option( self::get_option_name(), $settings );
	}

	/**
	 * Updates a specific setting through the shared storage validator.
	 *
	 * @param string $key   Setting key.
	 * @param mixed  $value New value.
	 * @return bool True if updated, false if identical or invalid.
	 */
	public static function update( string $key, $value ): bool {
		$settings = self::get_raw();

		if ( \array_key_exists( $key, $settings ) && $settings[ $key ] === $value ) {
			return false;
		}

		$result = self::persist( array( $key => $value ), $settings );

		return ! \is_wp_error( $result ) && (bool) $result;
	}

	/**
	 * Overrides base method to filter settings.
	 *
	 * @param array<string, mixed> $settings Merged settings.
	 * @return array<string, mixed> Filtered settings.
	 */
	protected static function filter_settings( array $settings ): array {
		return $settings;
	}

	/**
	 * Omits the obsolete empty passwords field created by version 1.0.0.
	 *
	 * Only an empty array is omitted. A non-empty passwords field is preserved
	 * because it may belong to an extended or premium settings implementation.
	 *
	 * @param array<string, mixed> $settings Raw stored settings.
	 * @return array<string, mixed> Settings after cleanup.
	 */
	private static function remove_obsolete_empty_passwords_field( array $settings ): array {
		if (
			! \array_key_exists( 'passwords', $settings )
			|| array() !== $settings['passwords']
		) {
			return $settings;
		}

		unset( $settings['passwords'] );

		return $settings;
	}

	/**
	 * Returns core keys that may be persisted in the free settings option.
	 *
	 * @return array<int, string>
	 */
	private static function get_storage_keys(): array {
		return array(
			'protection',
			'password',
			'cookie_type',
			'cookie_days',
			'session_salt',
			'design_settings',
		);
	}

	/**
	 * Ensures token invalidation salt is never stored empty.
	 *
	 * @param array<string, mixed> $settings Settings being prepared.
	 */
	private static function ensure_session_salt( array &$settings ): void {
		if ( empty( $settings['session_salt'] ) ) {
			$settings['session_salt'] = \wp_generate_password( 64, true, true );
		}
	}

	/**
	 * Encrypts the stored password value when present.
	 *
	 * @param array<string, mixed> $settings Settings being prepared.
	 */
	private static function encrypt_password_for_storage( array &$settings ): void {
		if (
			isset( $settings['password']['password'] )
			&& ! empty( $settings['password']['password'] )
		) {
			$settings['password']['password'] = Encryption::encrypt(
				(string) $settings['password']['password']
			);
		}
	}

	/**
	 * Checks whether settings contain an active password.
	 *
	 * @param array<string, mixed> $settings Settings to validate.
	 * @return bool True when an active password is present.
	 */
	private static function has_active_password( array $settings ): bool {
		$password = $settings['password'] ?? null;

		return \is_array( $password )
			&& ! empty( $password['password'] )
			&& ! empty( $password['is_active'] );
	}

	/**
	 * Loads design default settings directly from the JSON schema.
	 * Resolves translations dynamically to prevent WP 6.7+ early execution notices.
	 *
	 * @return array<string, mixed> Design settings array.
	 */
	private static function get_design_defaults(): array {
		if ( null === self::$design_defaults ) {
			$file_path = \plugin_dir_path( \PPADVP_PLUGIN_ABSOLUTE ) . 'config/DesignSettingsSchema.json';

			if (
				! \file_exists( $file_path )
				|| ! \function_exists( 'wp_json_file_decode' )
			) {
				self::$design_defaults = array();
			} else {
				$decoded = \wp_json_file_decode(
					$file_path,
					array( 'associative' => true )
				);

				self::$design_defaults = \is_array( $decoded )
					? $decoded
					: array();
			}
		}

		$defaults = self::$design_defaults;

		if ( \did_action( 'init' ) ) {
			$defaults['label']            = \__( 'Enter password', 'primeplaced-advanced-password-protection' );
			$defaults['inputPlaceholder'] = \__( 'Password...', 'primeplaced-advanced-password-protection' );
			$defaults['btnLabel']         = \__( 'Log in', 'primeplaced-advanced-password-protection' );
			$defaults['errorMsg']         = \__( 'Invalid password.', 'primeplaced-advanced-password-protection' );
		} else {
			$defaults['label']            = 'Enter password';
			$defaults['inputPlaceholder'] = 'Password...';
			$defaults['btnLabel']         = 'Log in';
			$defaults['errorMsg']         = 'Invalid password.';
		}

		return $defaults;
	}
}
