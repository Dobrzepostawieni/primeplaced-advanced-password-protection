<?php
/**
 * IP Resolver Service.
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
 * Class IpResolver
 */
class IpResolver {

	/**
	 * Retrieves the user IP address securely.
	 *
	 * @return string The validated IP address.
	 */
	public static function get_client_ip(): string {
		$ip = '127.0.0.1';

		if ( isset( $_SERVER['REMOTE_ADDR'] ) ) {
			$ip = \sanitize_text_field( \wp_unslash( $_SERVER['REMOTE_ADDR'] ) );
		}

		/**
		 * Filters whether to read IP from proxy headers.
		 * Default false for security against IP spoofing.
		 *
		 * @param bool $is_behind_proxy
		 */
		$is_behind_proxy = (bool) \apply_filters( 'ppadvp_is_behind_trusted_proxy', false );

		if ( $is_behind_proxy ) {
			$proxy_ip = self::get_ip_from_headers();

			if ( null !== $proxy_ip ) {
				$ip = $proxy_ip;
			}
		}

		$validated = \filter_var( $ip, \FILTER_VALIDATE_IP );

		return $validated ? (string) $validated : '127.0.0.1';
	}

	/**
	 * Checks proxy headers for IP address securely.
	 *
	 * @return string|null IP or null if not found.
	 */
	private static function get_ip_from_headers(): ?string {
		$headers = array( 'HTTP_CF_CONNECTING_IP', 'HTTP_X_REAL_IP', 'HTTP_X_FORWARDED_FOR' );
		foreach ( $headers as $header ) {
			if ( ! empty( $_SERVER[ $header ] ) ) {
				$sanitized = \sanitize_text_field( \wp_unslash( $_SERVER[ $header ] ) );
				$ip_array  = \explode( ',', $sanitized );

				$clean_ip = \trim( \reset( $ip_array ) );

				if ( \filter_var( $clean_ip, \FILTER_VALIDATE_IP ) ) {
					return $clean_ip;
				}
			}
		}

		return null;
	}
}
