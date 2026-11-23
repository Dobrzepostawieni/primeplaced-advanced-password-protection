<?php
/**
 * Session Manager Service.
 *
 * Handles HTTP cookies and cache-control headers.
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

/**
 * Class SessionManager
 */
class SessionManager {

	/**
	 * Sets a secure authentication cookie.
	 *
	 * @param string $name             Cookie name.
	 * @param string $value            Hash value.
	 * @param int    $expire_timestamp Unix timestamp for expiration.
	 * @param string $override_type    Optional. Override for cookie_type setting.
	 */
	public function set_cookie( string $name, string $value, int $expire_timestamp, string $override_type = '' ): void {
		$cookie_type = (string) Options::get( 'cookie_type' );

		if ( '' !== $override_type ) {
			$cookie_type = $override_type;
		}

		$session_cookie_types = (array) \apply_filters( 'ppadvp_session_cookie_types', array( 'session' ) );

		if ( \in_array( $cookie_type, $session_cookie_types, true ) ) {
			$expire_timestamp = 0;
		}

		$secure  = \is_ssl();
		$options = array(
			'expires'  => $expire_timestamp,
			'path'     => \defined( 'COOKIEPATH' ) && \COOKIEPATH ? \COOKIEPATH : '/',
			'domain'   => \defined( 'COOKIE_DOMAIN' ) && \COOKIE_DOMAIN ? \COOKIE_DOMAIN : '',
			'secure'   => $secure,
			'httponly' => true,
			'samesite' => 'Lax',
		);

		\setcookie( $name, $value, $options );

		$this->set_no_cache_headers();
	}

	/**
	 * Retrieves a sanitized cookie value.
	 *
	 * @param string $name Cookie name.
	 */
	public function get_cookie( string $name ): ?string {
		if ( ! isset( $_COOKIE[ $name ] ) ) {
			return null;
		}

		return \sanitize_text_field( \wp_unslash( (string) $_COOKIE[ $name ] ) );
	}

	/**
	 * Clears the authentication cookie.
	 *
	 * @param string $name Cookie name.
	 */
	public function clear_cookie( string $name ): void {
		$this->set_cookie( $name, '', \time() - \HOUR_IN_SECONDS );
	}

	/**
	 * Prevents proxy/plugin caching for pages setting or checking cookies.
	 */
	private function set_no_cache_headers(): void {
		if ( \headers_sent() ) {
			return;
		}

		\header( 'Vary: Cookie', false );
		\nocache_headers();
	}
}
