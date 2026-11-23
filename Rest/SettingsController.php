<?php
/**
 * Settings REST API Controller.
 *
 * Handles standard settings operations for the free version.
 * Implements Partial Update (PATCH logic) to prevent concurrent overwrite issues.
 *
 * @package    PPADVP
 * @author     Dobrzepostawieni <contact@dobrzepostawieni.pl>
 * @copyright  2026 Dobrzepostawieni.pl
 * @license    GPL-3.0-or-later
 */

namespace PPADVP\Rest;

// Prevent direct file access.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

use PPADVP\Rest\Abstracts\BaseSettingsController;
use PPADVP\Integrations\Capabilities;
use PPADVP\Services\Options;
use PPADVP\Services\Sanitizer;
use WP_REST_Request;
use WP_REST_Response;
use WP_Error;

/**
 * Class SettingsController
 */
class SettingsController extends BaseSettingsController {

	/**
	 * Returns the endpoint slug for settings.
	 *
	 * @return string Endpoint slug.
	 */
	protected function get_endpoint(): string {
		return 'settings';
	}

	/**
	 * Returns the schema class for settings validation.
	 *
	 * @return string Schema class name.
	 */
	protected function get_schema_class(): string {
		return SettingsSchema::class;
	}

	/**
	 * Checks if the current user has permissions to access/manage settings.
	 * Overrides the base controller to allow users who can only protect content (e.g., Authors).
	 *
	 * @param WP_REST_Request $request The request object.
	 * @return bool True if authorized, false otherwise.
	 */
	public function permissions_check( WP_REST_Request $request ): bool {
		return Capabilities::current_user_can_manage_settings() || Capabilities::current_user_can_protect_content();
	}

	/**
	 * POST: Updates settings with support for Partial updates (PATCH-like).
	 * Prevents race-conditions by merging incoming data with fresh DB state and enforces encryption.
	 *
	 * @param WP_REST_Request $request The REST request object.
	 * @return WP_REST_Response|WP_Error Response data or error object.
	 */
	public function update_settings( WP_REST_Request $request ) {
		$raw_params = $request->get_params();
		if ( ! \is_array( $raw_params ) ) {
			return new WP_Error(
				'invalid_data',
				\__( 'Invalid request data format.', 'primeplaced-advanced-password-protection' ),
				array( 'status' => 400 )
			);
		}

		$body_params = $request->get_json_params();
		if ( ! \is_array( $body_params ) ) {
			$body_params = $request->get_body_params();
		}

		$schema      = SettingsSchema::get();
		$properties  = isset( $schema['properties'] ) && \is_array( $schema['properties'] ) ? $schema['properties'] : array();
		$unsupported = \array_diff( \array_keys( $body_params ), \array_keys( $properties ) );
		if ( ! empty( $unsupported ) ) {
			return new WP_Error(
				'rest_invalid_param',
				\sprintf(
					/* translators: %s: comma-separated list of unsupported settings fields. */
					\__( 'Unsupported settings fields: %s.', 'primeplaced-advanced-password-protection' ),
					\implode( ', ', $unsupported )
				),
				array(
					'status' => 400,
					'params' => \array_fill_keys( $unsupported, \__( 'This field is not part of the settings schema.', 'primeplaced-advanced-password-protection' ) ),
				)
			);
		}

		$external_validation = \apply_filters( 'ppadvp_rest_settings_validation', null, $raw_params, $request );
		if ( $external_validation instanceof WP_Error ) {
			return $external_validation;
		}

		$current_settings = Options::get_raw();
		$filtered_params  = $this->filter_params_by_capability( $raw_params, $current_settings );

		$allowed_keys = array(
			'protection',
			'password',
			'cookie_type',
			'cookie_days',
			'session_salt',
			'design_settings',
		);

		$has_core_updates = false;
		foreach ( \array_keys( $filtered_params ) as $key ) {
			if ( \in_array( $key, $allowed_keys, true ) ) {
				$has_core_updates = true;
				break;
			}
		}

		if ( empty( $current_settings['session_salt'] ) ) {
			$has_core_updates = true;
		}

		$prepared_settings = Options::prepare_for_storage( $filtered_params, $current_settings );
		$validation        = Options::validate_for_storage( $prepared_settings );

		if ( \is_wp_error( $validation ) ) {
			return $validation;
		}

		if ( $has_core_updates ) {
			\update_option( Options::get_option_name(), $prepared_settings );
			\do_action( 'ppadvp_admin_settings_explicitly_saved' );
		}

		\do_action( 'ppadvp_settings_saved', $raw_params );

		return $this->get_settings();
	}

	/**
	 * Filters incoming parameters based on user capabilities.
	 *
	 * @param array<string, mixed> $params           The raw input parameters.
	 * @param array<string, mixed> $current_settings Current saved settings.
	 * @return array<string, mixed> Filtered parameters.
	 */
	private function filter_params_by_capability( array $params, array $current_settings ): array {
		if ( \current_user_can( Capabilities::CAP_MANAGE_SETTINGS ) ) {
			return $params;
		}

		$user_id        = \get_current_user_id();
		$current_author = (int) ( $current_settings['password']['author_id'] ?? 0 );

		if ( \array_key_exists( 'password', $params ) ) {
			if ( 0 !== $current_author && $current_author !== $user_id ) {
				unset( $params['password'] );
			} elseif ( \is_array( $params['password'] ) ) {
				$params['password']['author_id'] = $user_id;
			}
		}

		unset(
			$params['protection'],
			$params['design_settings'],
			$params['cookie_type'],
			$params['cookie_days'],
			$params['session_salt']
		);

		$params = (array) \apply_filters( 'ppadvp_rest_settings_filter_params', $params );

		unset(
			$params['protection'],
			$params['design_settings'],
			$params['cookie_type'],
			$params['cookie_days'],
			$params['session_salt']
		);

		return $params;
	}

	/**
	 * Retrieves and filters settings based on user capabilities, appending readonly data.
	 *
	 * @return array<string, mixed> Filtered settings array with capabilities.
	 */
	protected function get_response_data(): array {
		$settings             = Options::get_all();
		$settings['password'] = isset( $settings['password'] ) ? (array) $settings['password'] : null;

		$settings = (array) \apply_filters( 'ppadvp_rest_settings_response', $settings );
		$settings = $this->redact_write_only_secrets( $settings );

		if ( ! \current_user_can( Capabilities::CAP_MANAGE_SETTINGS ) ) {
			$settings = $this->redact_settings_for_content_manager( $settings );
		}

		return $settings;
	}

	/**
	 * Keeps write-only values out of standard settings responses.
	 *
	 * Password metadata remains available to the admin UI. An authorized user
	 * may request the value explicitly through the dedicated reveal endpoint.
	 *
	 * @param array<string, mixed> $settings Response settings.
	 * @return array<string, mixed> Redacted settings.
	 */
	private function redact_write_only_secrets( array $settings ): array {
		if ( isset( $settings['password'] ) && \is_array( $settings['password'] ) ) {
			$settings['password']['password'] = '';
		}

		$settings['session_salt'] = '';

		return $settings;
	}

	/**
	 * Removes global/sensitive settings for users without settings capability.
	 *
	 * @param array<string, mixed> $settings Response settings.
	 * @return array<string, mixed> Redacted settings.
	 */
	private function redact_settings_for_content_manager( array $settings ): array {
		unset(
			$settings['password'],
			$settings['recaptcha_secret_key'],
			$settings['recaptcha_site_key'],
			$settings['allowed_ips'],
			$settings['roles'],
			$settings['manager_roles']
		);

		$settings['session_salt'] = '';

		return $settings;
	}
}
