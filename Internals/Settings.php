<?php
/**
 * Settings Registration Integration.
 *
 * Registers the plugin settings in WordPress Core.
 * This integration bridges Admin (Sanitization) and REST (Schema).
 *
 * @package   PPADVP
 * @author    Dobrzepostawieni <contact@dobrzepostawieni.pl>
 * @copyright 2026 Dobrzepostawieni.pl
 * @license   GPL-3.0-or-later
 */

namespace PPADVP\Internals;

// Prevent direct file access.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

use PPADVP\Engine\Base;
use PPADVP\Engine\Traits\SettingsRegistrar;
use PPADVP\Rest\SettingsSchema;
use PPADVP\Services\Encryption;
use PPADVP\Services\Options;

/**
 * Class Settings
 */
class Settings extends Base {
	use SettingsRegistrar;

	/**
	 * Initialize the class and register hooks.
	 *
	 * @return bool True on success, false on failure.
	 */
	public function initialize(): bool {
		if ( ! parent::initialize() ) {
			return false;
		}

		\add_action( 'init', array( $this, 'register_settings' ) );
		\add_filter( 'option_' . Options::get_option_name(), array( $this, 'decrypt_on_read' ) );

		return true;
	}

	/**
	 * Registers all plugin settings.
	 */
	public function register_settings(): void {
		$this->register_main_setting(
			Options::get_option_name(),
			array(
				'type'              => 'object',
				'show_in_rest'      => array(
					'schema' => SettingsSchema::get(),
				),
				'default'           => Options::get_defaults(),
				'sanitize_callback' => array( $this, 'sanitize_main_settings' ),
			)
		);
	}

	/**
	 * Main Sanitize Callback.
	 *
	 * @param array<string, mixed> $input Full settings array.
	 * @return array<string, mixed> Sanitized array.
	 */
	public function sanitize_main_settings( array $input ): array {
		if ( ! \is_array( $input ) ) {
			return array();
		}

		$settings   = Options::prepare_for_storage( $input );
		$validation = Options::validate_for_storage( $settings );

		if ( \is_wp_error( $validation ) ) {
			if ( \function_exists( 'add_settings_error' ) ) {
				\add_settings_error(
					Options::get_option_name(),
					(string) $validation->get_error_code(),
					$validation->get_error_message(),
					'error'
				);
			}

			return Options::prepare_for_storage( array(), Options::get_raw() );
		}

		return $settings;
	}

	/**
	 * Decrypt callback.
	 *
	 * @param mixed $value Full settings array from DB.
	 * @return array<string, mixed>|mixed Settings array
	 */
	public function decrypt_on_read( $value ) {
		if ( ! \is_array( $value ) || empty( $value['password'] ) || ! \is_array( $value['password'] ) || empty( $value['password']['password'] ) ) {
			return $value;
		}

		$value['password']['password'] = Encryption::decrypt( (string) $value['password']['password'] );

		return $value;
	}
}
