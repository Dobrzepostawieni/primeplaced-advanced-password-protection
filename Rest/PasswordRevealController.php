<?php
/**
 * Password Reveal REST Controller.
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

use PPADVP\Engine\Base;
use PPADVP\Integrations\Capabilities;
use PPADVP\Services\Options;
use WP_Error;
use WP_REST_Request;
use WP_REST_Response;
use WP_REST_Server;

/**
 * Provides explicit, capability-protected password reveal requests.
 */
class PasswordRevealController extends Base {

	/**
	 * Initializes the REST route.
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
	 * Registers the password reveal endpoint.
	 */
	public function register_routes(): void {
		\register_rest_route(
			\PPADVP_API_NAMESPACE,
			'/password/reveal',
			array(
				'methods'             => WP_REST_Server::CREATABLE,
				'callback'            => array( $this, 'reveal_password' ),
				'permission_callback' => array( $this, 'permissions_check' ),
				'args'                => array(
					'id' => array(
						'required'          => true,
						'type'              => 'string',
						'maxLength'         => 64,
						'sanitize_callback' => 'sanitize_text_field',
						'validate_callback' => 'rest_validate_request_arg',
					),
				),
			)
		);
	}

	/**
	 * Requires the global plugin-settings capability.
	 *
	 * Cookie-authenticated REST requests are additionally protected by the
	 * WordPress REST nonce sent by the admin application.
	 *
	 * @return bool True when the current user may reveal saved passwords.
	 */
	public function permissions_check(): bool {
		return Capabilities::current_user_can_manage_settings();
	}

	/**
	 * Returns only the requested password value.
	 *
	 * @param WP_REST_Request $request REST request.
	 * @return WP_REST_Response|WP_Error Password response or not-found error.
	 */
	public function reveal_password( WP_REST_Request $request ) {
		$password_id = \sanitize_text_field( (string) $request->get_param( 'id' ) );
		$password    = Options::get( 'password' );
		$entry       = \is_array( $password ) && (string) ( $password['id'] ?? '' ) === $password_id
			? $password
			: null;

		/**
		 * Allows a premium implementation to resolve an authorized password ID.
		 *
		 * @param array<string, mixed>|null $entry       Resolved Core entry.
		 * @param string                    $password_id Requested password ID.
		 * @param WP_REST_Request           $request     REST request.
		 */
		$entry = \apply_filters( 'ppadvp_password_reveal_entry', $entry, $password_id, $request );

		if (
			'' === $password_id
			|| ! \is_array( $entry )
			|| (string) ( $entry['id'] ?? '' ) !== $password_id
			|| ! isset( $entry['password'] )
			|| '' === (string) $entry['password']
		) {
			return new WP_Error(
				'ppadvp_password_not_found',
				\__( 'The requested password could not be found.', 'primeplaced-advanced-password-protection' ),
				array( 'status' => 404 )
			);
		}

		$response = new WP_REST_Response(
			array( 'password' => (string) $entry['password'] ),
			200
		);
		$response->header( 'Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0, private' );
		$response->header( 'Pragma', 'no-cache' );
		$response->header( 'Expires', '0' );

		return $response;
	}
}
