<?php
/**
 * Site Access Guard.
 *
 * @package    PPADVP
 * @author     Dobrzepostawieni <contact@dobrzepostawieni.pl>
 * @copyright  2026 Dobrzepostawieni.pl
 * @license    GPL-3.0-or-later
 */

namespace PPADVP\Frontend;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

use PPADVP\Engine\Base;
use PPADVP\Services\Interfaces\AuthCookieStrategy;
use PPADVP\Services\Options;
use PPADVP\Services\SecurityProvider;
use PPADVP\Services\SessionManager;

/**
 * Class AccessGuard
 */
class AccessGuard extends Base {
	/**
	 * Name of the cookie used for authorization.
	 */
	public const COOKIE_NAME = 'site_access_token';

	/**
	 * Security provider instance.
	 */
	private SecurityProvider $security;

	/**
	 * Cookie strategy instance.
	 */
	private AuthCookieStrategy $cookie_strategy;

	/**
	 * Session manager instance.
	 */
	private SessionManager $session;

	/**
	 * Stores the runtime error message for the lock screen.
	 */
	private string $runtime_error = '';

	/**
	 * AccessGuard constructor.
	 *
	 * @param SecurityProvider   $security        Security provider service.
	 * @param AuthCookieStrategy $cookie_strategy Cookie naming and hashing strategy.
	 * @param SessionManager     $session         Session state manager.
	 */
	public function __construct(
		SecurityProvider $security,
		AuthCookieStrategy $cookie_strategy,
		SessionManager $session
	) {
		$this->security        = $security;
		$this->cookie_strategy = $cookie_strategy;
		$this->session         = $session;
	}

	/**
	 * Initialize the class and attach WordPress hooks.
	 *
	 * @return bool True on successful initialization, false otherwise.
	 */
	public function initialize(): bool {
		if ( ! parent::initialize() ) {
			return false;
		}

		\add_action( 'template_redirect', array( $this, 'handle_access_control' ), \PHP_INT_MIN );
		\add_action( 'rest_api_init', array( $this, 'register_rest_protections' ) );

		return true;
	}

	/**
	 * Main handler evaluating site access permissions.
	 */
	public function handle_access_control(): void {
		if ( ! (bool) Options::get( 'protection' ) ) {
			return;
		}

		$password_data = $this->get_valid_password_data();

		if ( ! $this->security->is_password_active_now( $password_data ) ) {
			return;
		}

		if ( $this->is_request_excluded() ) {
			return;
		}

		if ( $this->is_user_authenticated( $password_data ) ) {
			$this->prevent_caching_and_optimizations();
			return;
		}

		if ( $this->is_post_password_valid( $password_data ) ) {
			$this->prevent_caching_and_optimizations();
			return;
		}

		$this->prevent_caching_and_optimizations();

		$this->lock_site_access();
	}

	/**
	 * Registers REST API response filters for all public post types.
	 */
	public function register_rest_protections(): void {
		$post_types = \get_post_types( array( 'show_in_rest' => true ), 'names' );
		foreach ( $post_types as $post_type ) {
			\add_filter( "rest_prepare_{$post_type}", array( $this, 'protect_rest_response' ), 999, 3 );
		}
	}

	/**
	 * Protects the REST API response for posts by redacting content when not authenticated.
	 *
	 * @param \WP_REST_Response $response The response object.
	 * @param \WP_Post          $post     The post object.
	 * @param \WP_REST_Request  $request  The request object.
	 * @return \WP_REST_Response Modified response object.
	 */
	public function protect_rest_response( \WP_REST_Response $response, \WP_Post $post, \WP_REST_Request $request ): \WP_REST_Response {
		if ( ! (bool) Options::get( 'protection' ) ) {
			return $response;
		}

		$password_data = (array) Options::get( 'password' );
		$password_data = (array) \apply_filters( 'ppadvp_get_valid_password_data_for_request', $password_data, $post->ID, 'post' );
		if ( ! $this->security->is_password_active_now( $password_data ) ) {
			return $response;
		}

		if ( ! \apply_filters( 'ppadvp_should_protect_request', true ) ) {
			return $response;
		}

		if ( \current_user_can( 'edit_post', $post->ID ) ) {
			return $response;
		}

		if ( $this->is_user_authenticated( $password_data, $post->ID ) ) {
			$this->prevent_caching_and_optimizations();
			return $response;
		}

		$response->set_data(
			array(
				'id'      => $post->ID,
				'message' => \__( 'Content protected.', 'primeplaced-advanced-password-protection' ),
			)
		);
		$response->set_status( 401 );

		return $response;
	}

	/**
	 * Validates if the current user possesses a valid authentication cookie.
	 *
	 * @param array<string, mixed> $password_data The single password entry data array.
	 * @param int|null             $object_id     Optional object ID context for REST API checks.
	 * @return bool True if the user has a valid authorization cookie, false otherwise.
	 */
	private function is_user_authenticated( array $password_data, ?int $object_id = null ): bool {
		$object_id   = $object_id ?? \get_queried_object_id();
		$cookie_name = $this->cookie_strategy->get_cookie_name( self::COOKIE_NAME, $object_id );

		$token = $this->session->get_cookie( $cookie_name );

		$suffix   = $this->cookie_strategy->get_hash_suffix( $object_id );
		$raw_salt = Options::get( 'session_salt' );
		$salt     = \is_string( $raw_salt ) ? $raw_salt : '';

		$is_valid = false;
		if ( ! empty( $token ) ) {
			$is_valid = $this->security->verify_token( (string) $token, $password_data, $suffix, $salt );
		}

		/**
		 * Filter the validation result to allow extensions to authorize the user.
		 *
		 * @param bool                 $is_valid      Current validation status.
		 * @param array<int, mixed>    $passwords     Array of password data.
		 * @param int                  $object_id     The queried object ID.
		 * @param string               $salt          The session salt.
		 */
		$is_valid = (bool) \apply_filters( 'ppadvp_auth_cookie_validation_result', $is_valid, array( $password_data ), $object_id, $salt );

		if ( $is_valid ) {
			\do_action( 'ppadvp_auth_cookie_valid', (string) $token, $cookie_name );
		}

		return $is_valid;
	}

	/**
	 * Validates direct POST submissions bypassing REST API requests.
	 *
	 * @param array<string, mixed> $password_data The single password entry data array.
	 * @return bool True if a valid password was submitted via POST, false otherwise.
	 */
	private function is_post_password_valid( array $password_data ): bool {
		if ( empty( $_POST['ppadvp_lock_pass'] ) || empty( $_POST['ppadvp_nonce'] ) ) {
			return false;
		}

		$limiter = new \PPADVP\Services\RateLimiter();

		if ( ! $limiter->consume( 'password_check', 600 ) ) {
			$this->runtime_error = \__( 'Too many attempts. Try again in 10 minutes.', 'primeplaced-advanced-password-protection' );
			return false;
		}

		if ( ! \wp_verify_nonce( \sanitize_text_field( \wp_unslash( $_POST['ppadvp_nonce'] ) ), 'wp_rest' ) ) {
			$limiter->release( 'password_check', 600 );
			$this->runtime_error = \__( 'Session expired. Please refresh the page.', 'primeplaced-advanced-password-protection' );
			return false;
		}

		// phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized -- Raw password must not be sanitized as it strips valid complex characters.
		$input_pass = \trim( \wp_unslash( (string) $_POST['ppadvp_lock_pass'] ) );

		$matched_password = $this->security->get_matched_password( $input_pass, $password_data );
		$is_valid         = ( null !== $matched_password );
		$object_id        = \get_queried_object_id();

		\do_action(
			'ppadvp_security_event',
			'password_evaluated',
			array(
				'status'      => $is_valid ? 'success' : 'error',
				'password_id' => \is_array( $matched_password ) ? \sanitize_text_field( (string) ( $matched_password['id'] ?? '' ) ) : '',
				'object_id'   => $object_id,
			)
		);

		if ( ! $is_valid ) {
			$error_msg           = Options::get_design( 'errorMsg' );
			$this->runtime_error = ! empty( $error_msg ) ? (string) $error_msg : \__( 'Invalid password.', 'primeplaced-advanced-password-protection' );
		} else {
			$limiter->release( 'password_check', 600 );
			$remember_me = ! empty( $_POST['ppadvp_remember_me'] );
			$salt        = (string) Options::get( 'session_salt' );
			$this->set_auth_cookie( $input_pass, $salt, $object_id, $remember_me );
		}

		return $is_valid;
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

		$expire      = ( 'duration' === $cookie_type ) ? \time() + ( $option_days * DAY_IN_SECONDS ) : 0;
		$cookie_name = $this->cookie_strategy->get_cookie_name( self::COOKIE_NAME, $object_id );
		$hash_suffix = $this->cookie_strategy->get_hash_suffix( $object_id );

		$base_hash  = $this->security->calculate_hash( $password . $hash_suffix, $salt );
		$final_hash = $remember_me ? $base_hash . '|1' : $base_hash;

		$this->session->set_cookie( $cookie_name, $final_hash, $expire );
	}

	/**
	 * Retrieves the active password data contextually filtered for the current request.
	 *
	 * @return array<string, mixed> The single password entry array.
	 */
	private function get_valid_password_data(): array {
		$password_data = (array) Options::get( 'password' );

		$context_id   = \get_queried_object_id();
		$context_type = ( \is_category() || \is_tag() || \is_tax() ) ? 'term' : 'post';

		/**
		 * Filter the valid password data for the current request.
		 *
		 * @param array<string, mixed> $password_data The global password entry.
		 * @param int                  $context_id    The current queried object ID.
		 * @param string               $context_type  The current queried object type.
		 */
		return (array) \apply_filters( 'ppadvp_get_valid_password_data_for_request', $password_data, $context_id, $context_type );
	}

	/**
	 * Evaluates whether the current request is exempt from protection.
	 *
	 * @return bool True if the request should bypass protection, false otherwise.
	 */
	protected function is_request_excluded(): bool {
		if ( ! \apply_filters( 'ppadvp_should_protect_request', true ) ) {
			return true;
		}

		if ( \defined( 'WP_CLI' ) && \WP_CLI ) {
			return true;
		}

		if ( \defined( 'DOING_CRON' ) && DOING_CRON ) {
			return true;
		}

		global $pagenow;

		if ( \in_array( $pagenow, array( 'wp-login.php', 'wp-register.php' ), true ) ) {
			return true;
		}

		$request_uri = isset( $_SERVER['REQUEST_URI'] ) ? \esc_url_raw( \wp_unslash( $_SERVER['REQUEST_URI'] ) ) : '';
		$parsed_path = \wp_parse_url( $request_uri, \PHP_URL_PATH );

		if ( ( \defined( 'REST_REQUEST' ) && \REST_REQUEST ) || ( \is_string( $parsed_path ) && false !== \strpos( $parsed_path, '/' . \rest_get_url_prefix() . '/' ) ) ) {
			return true;
		}

		return false;
	}

	/**
	 * Injects headers and constants to block external caching mechanisms.
	 */
	private function prevent_caching_and_optimizations(): void {
		if ( ! \defined( 'DONOTCACHEPAGE' ) ) {
			// phpcs:ignore WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedConstantFound
			\define( 'DONOTCACHEPAGE', true );
		}

		\nocache_headers();
	}

	/**
	 * Halts execution and renders the password input screen.
	 */
	private function lock_site_access(): void {
		if ( \is_feed() ) {
			\wp_die(
				\esc_html__( 'Content protected.', 'primeplaced-advanced-password-protection' ),
				'',
				array( 'response' => 403 )
			);
		}

		$renderer = new LockScreenRenderer();
		$renderer->render( $this->runtime_error );
		exit;
	}
}
