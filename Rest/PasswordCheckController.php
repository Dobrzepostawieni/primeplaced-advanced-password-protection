<?php
/**
 * Password Check REST Controller.
 *
 * @package    PPADVP
 * @author     Dobrzepostawieni <contact@dobrzepostawieni.pl>
 * @copyright  2026 Dobrzepostawieni.pl
 * @license    GPL-3.0-or-later
 */

namespace PPADVP\Rest;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

use PPADVP\Engine\Base;
use PPADVP\Services\Interfaces\AuthCookieStrategy;
use PPADVP\Services\Options;
use PPADVP\Services\RateLimiter;
use PPADVP\Services\SecurityProvider;
use PPADVP\Services\SessionManager;
use WP_REST_Request;
use WP_REST_Response;
use WP_REST_Server;

/**
 * Class PasswordCheckController
 */
class PasswordCheckController extends Base {

	/**
	 * Name of the cookie used for authorization.
	 */
	public const COOKIE_NAME = 'site_access_token';

	/**
	 * Security provider instance.
	 */
	private SecurityProvider $security;

	/**
	 * Rate limiter instance.
	 */
	private RateLimiter $limiter;

	/**
	 * Cookie strategy instance.
	 */
	private AuthCookieStrategy $cookie_strategy;

	/**
	 * Session manager instance.
	 */
	private SessionManager $session;

	/**
	 * PasswordCheckController constructor.
	 *
	 * @param SecurityProvider   $security        Security provider service.
	 * @param RateLimiter        $limiter         Request rate limiter.
	 * @param AuthCookieStrategy $cookie_strategy Cookie naming and hashing strategy.
	 * @param SessionManager     $session         Session state manager.
	 */
	public function __construct(
		SecurityProvider $security,
		RateLimiter $limiter,
		AuthCookieStrategy $cookie_strategy,
		SessionManager $session
	) {
		$this->security        = $security;
		$this->limiter         = $limiter;
		$this->cookie_strategy = $cookie_strategy;
		$this->session         = $session;
	}

	/**
	 * Initialize the controller and register REST routes.
	 *
	 * @return bool True on successful initialization, false otherwise.
	 */
	public function initialize(): bool {
		if ( ! parent::initialize() ) {
			return false;
		}

		\add_action( 'rest_api_init', array( $this, 'register_routes' ) );

		return true;
	}

	/**
	 * Registers the endpoint for password validation.
	 */
	public function register_routes(): void {
		\register_rest_route(
			\PPADVP_API_NAMESPACE,
			'/check-password',
			array(
				'methods'             => WP_REST_Server::CREATABLE,
				'callback'            => array( $this, 'handle_check' ),
				'permission_callback' => '__return_true',
				'args'                => array(
					'password'    => array(
						'required'          => true,
						'type'              => 'string',
						'sanitize_callback' => function ( $param ) {
							return \trim( (string) $param );
						},
					),
					'object_id'   => array(
						'required'          => false,
						'type'              => 'integer',
						'sanitize_callback' => 'absint',
					),
					'remember_me' => array(
						'required' => false,
						'type'     => 'boolean',
						'default'  => false,
					),
				),
			)
		);
	}

	/**
	 * Handles the incoming password verification request.
	 *
	 * @param WP_REST_Request $request The WordPress REST API request object.
	 * @return WP_REST_Response|\WP_Error Response object or error on failure.
	 */
	public function handle_check( WP_REST_Request $request ) {
		$object_id = $request->get_param( 'object_id' ) ? \absint( $request->get_param( 'object_id' ) ) : 0;
		if ( ! $this->limiter->consume( 'password_check', 600 ) ) {
			return new \WP_Error(
				'rate_limit_exceeded',
				\__( 'Too many attempts. Try again in 10 minutes.', 'primeplaced-advanced-password-protection' ),
				array( 'status' => 429 )
			);
		}

		$input_pass       = $request->get_param( 'password' ) ? \trim( (string) $request->get_param( 'password' ) ) : '';
		$password_data    = (array) Options::get( 'password' );
		$matched_password = $this->security->get_matched_password( $input_pass, $password_data );
		/**
		 * Filter allowing external evaluation of the password input.
		 *
		 * @param array|null $matched_password The matched password object, or null.
		 * @param string     $input_pass       The raw input password.
		 * @param int        $object_id        The context ID.
		 * * @var array<string, mixed>|null $matched_password
		 */
		$matched_password = \apply_filters( 'ppadvp_evaluate_password_input', $matched_password, $input_pass, $object_id );

		$event_args = array(
			'status'      => null !== $matched_password ? 'success' : 'error',
			'password_id' => \is_array( $matched_password ) ? \sanitize_text_field( (string) ( $matched_password['id'] ?? '' ) ) : '',
			'object_id'   => $object_id,
		);
		$event_args = (array) \apply_filters( 'ppadvp_password_evaluation_event_args', $event_args, $object_id );

		\do_action(
			'ppadvp_security_event',
			'password_evaluated',
			$event_args
		);
		if ( null !== $matched_password ) {
			$this->limiter->release( 'password_check', 600 );
			$remember_me = ! empty( $request->get_param( 'remember_me' ) );
			$salt        = (string) Options::get( 'session_salt' );
			$this->set_auth_cookie( $input_pass, $salt, $object_id, $remember_me );
			return new WP_REST_Response(
				array(
					'success' => true,
					'message' => \__( 'Password correct.', 'primeplaced-advanced-password-protection' ),
				),
				200
			);
		}

		return new WP_REST_Response(
			array(
				'success' => false,
				'message' => (string) Options::get_design( 'errorMsg' ),
				'code'    => 'invalid_password',
			),
			200
		);
	}

	/**
	 * Instructs the session manager to emit the authorization cookie.
	 *
	 * @param string $password    The valid password provided by the user.
	 * @param string $salt        The cryptographic system salt.
	 * @param int    $object_id   The context ID associated with the request.
	 * @param bool   $remember_me Indicates whether the user opted to extend session lifetime.
	 */
	private function set_auth_cookie( string $password, string $salt, int $object_id, bool $remember_me ): void {
		$cookie_type = (string) Options::get( 'cookie_type' );
		$option_days = \absint( Options::get( 'cookie_days' ) );

		if ( 0 === $option_days ) {
			$option_days = 7;
		}

		$expire = ( 'duration' === $cookie_type ) ? \time() + ( $option_days * DAY_IN_SECONDS ) : 0;

		$cookie_name = $this->cookie_strategy->get_cookie_name( self::COOKIE_NAME, $object_id );
		$hash_suffix = $this->cookie_strategy->get_hash_suffix( $object_id );
		$base_hash   = $this->security->calculate_hash( $password . $hash_suffix, $salt );
		$final_hash  = $remember_me ? $base_hash . '|1' : $base_hash;

		$this->session->set_cookie( $cookie_name, $final_hash, $expire );
	}
}
