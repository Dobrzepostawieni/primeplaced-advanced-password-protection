<?php
/**
 * Abstract Settings Controller.
 *
 * Provides a standardized structure for REST API settings endpoints.
 *
 * @package   PPADVP
 * @author    Dobrzepostawieni <contact@dobrzepostawieni.pl>
 * @copyright 2026 Dobrzepostawieni.pl
 * @license   GPL-3.0-or-later
 */

namespace PPADVP\Rest\Abstracts;

// Prevent direct file access.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

use PPADVP\Engine\Base;
use PPADVP\Integrations\Capabilities;
use WP_REST_Request;
use WP_REST_Response;
use WP_REST_Server;

/**
 * Class BaseSettingsController
 */
abstract class BaseSettingsController extends Base {

	/**
	 * Returns the REST route endpoint slug.
	 *
	 * @return string Endpoint slug (e.g., 'settings').
	 */
	abstract protected function get_endpoint(): string;

	/**
	 * Returns the Schema class name used for REST validation.
	 *
	 * @return string Full class namespace.
	 */
	abstract protected function get_schema_class(): string;

	/**
	 * Returns the response data merged with dynamic environment context.
	 *
	 * @return array<string, mixed> Settings data array.
	 */
	abstract protected function get_response_data(): array;

	/**
	 * Initializes the controller and registers WordPress hooks.
	 *
	 * @return bool True on success, false otherwise.
	 */
	public function initialize(): bool {
		if ( ! parent::initialize() ) {
			return false;
		}
		\add_action( 'rest_api_init', array( $this, 'register_routes' ) );
		return true;
	}

	/**
	 * Registers the GET (READABLE) and POST (CREATABLE) routes with native Schema validation.
	 */
	public function register_routes(): void {
		$schema_callback = array( $this->get_schema_class(), 'get' );
		if ( ! \is_callable( $schema_callback ) ) {
			return;
		}

		$schema = \call_user_func( $schema_callback );
		$args   = array();
		if ( \is_array( $schema ) && isset( $schema['properties'] ) ) {
			foreach ( $schema['properties'] as $key => $property ) {
				$arg = $property;
				if ( isset( $arg['type'] ) && \is_array( $arg['type'] ) ) {
					$filtered_types = \array_filter(
						$arg['type'],
						function ( $t ) {
							return 'null' !== $t && \is_string( $t );
						}
					);
					$arg['type']    = ! empty( $filtered_types ) ? \reset( $filtered_types ) : 'string';
				}

				$arg['validate_callback'] = 'rest_validate_request_arg';
				$arg['sanitize_callback'] = 'rest_sanitize_request_arg';

				unset( $arg['default'] );

				$args[ $key ] = $arg;
			}
		}

		\register_rest_route(
			\PPADVP_API_NAMESPACE,
			'/' . $this->get_endpoint(),
			array(
				array(
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => array( $this, 'get_settings' ),
					'permission_callback' => array( $this, 'permissions_check' ),
					'schema'              => array( $this->get_schema_class(), 'get' ),
				),
				array(
					'methods'             => WP_REST_Server::CREATABLE,
					'callback'            => array( $this, 'update_settings' ),
					'permission_callback' => array( $this, 'permissions_check' ),
					'args'                => $args,
				),
			)
		);
	}

	/**
	 * Checks if the current user has permissions to manage protection.
	 *
	 * @param WP_REST_Request $request The request object.
	 * @return bool True if authorized, false otherwise.
	 */
	public function permissions_check( WP_REST_Request $request ): bool {
		return Capabilities::current_user_can_manage_settings();
	}

	/**
	 * GET: Handles the retrieval of plugin settings.
	 *
	 * @return WP_REST_Response The REST response object.
	 */
	public function get_settings(): WP_REST_Response {
		return \rest_ensure_response( $this->get_response_data() );
	}
}
