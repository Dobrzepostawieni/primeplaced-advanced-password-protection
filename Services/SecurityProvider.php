<?php
/**
 * Security Provider Service.
 *
 * @package    PPADVP
 * @author     Dobrzepostawieni <contact@dobrzepostawieni.pl>
 * @copyright  2026 Dobrzepostawieni.pl
 * @license    GPL-3.0-or-later
 */

namespace PPADVP\Services;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Class SecurityProvider
 */
class SecurityProvider {
	/**
	 * Verifies an authentication token against the site password.
	 *
	 * @param string               $token         Token extracted from the authorization cookie.
	 * @param array<string, mixed> $password_data The single password entry data array.
	 * @param string               $suffix        Contextual cookie hash suffix.
	 * @param string               $salt          System cryptographic salt.
	 * @return bool True if the token is valid and matches the active password, false otherwise.
	 */
	public function verify_token( string $token, array $password_data, string $suffix, string $salt ): bool {
		if ( empty( $token ) || ! $this->is_password_active_now( $password_data ) ) {
			return false;
		}

		$parts          = \explode( '|', $token );
		$hash_to_check  = $parts[0];
		$plain_password = (string) ( $password_data['password'] ?? '' );

		$plain_password = Encryption::decrypt( $plain_password );

		$expected_hash = $this->calculate_hash( $plain_password . $suffix, $salt );
		return \hash_equals( $expected_hash, $hash_to_check );
	}

	/**
	 * Validates raw user input against the stored password entry.
	 *
	 * @param string               $input         Raw password string provided by the user.
	 * @param array<string, mixed> $password_data The single password entry data array.
	 * @return bool True if the input matches the stored active password, false otherwise.
	 */
	public function validate_input( string $input, array $password_data ): bool {
		return null !== $this->get_matched_password( $input, $password_data );
	}

	/**
	 * Returns the matched password entry if the input is valid and the password is active.
	 *
	 * @param string               $input         Raw password string provided by the user.
	 * @param array<string, mixed> $password_data The single password entry data array.
	 * @return array<string, mixed>|null The password entry array if matched, null otherwise.
	 */
	public function get_matched_password( string $input, array $password_data ): ?array {
		if ( ! $this->is_password_active_now( $password_data ) ) {
			return null;
		}

		$input_hash     = \hash( 'sha256', $input );
		$plain_password = (string) ( $password_data['password'] ?? '' );
		$plain_password = Encryption::decrypt( $plain_password );
		$stored_hash    = \hash( 'sha256', $plain_password );

		return \hash_equals( $stored_hash, $input_hash ) ? $password_data : null;
	}

	/**
	 * Checks if the given password entry exists and is currently marked as active.
	 *
	 * @param array<string, mixed> $entry The single password entry data array.
	 * @return bool True if the password contains required data and is active, false otherwise.
	 */
	public function is_password_active_now( array $entry ): bool {
		if ( empty( $entry ) || empty( $entry['password'] ) ) {
			return false;
		}

		$is_active = ! empty( $entry['is_active'] );

		/**
		 * Filters whether the password is currently active.
		 *
		 * @param bool                 $is_active Whether the password is active by default.
		 * @param array<string, mixed> $entry     The password entry data.
		 */
		return (bool) \apply_filters( 'ppadvp_is_password_active', $is_active, $entry );
	}

	/**
	 * Calculates HMAC hash for secure storage or cookie verification.
	 *
	 * @param string $data The raw string data to be hashed.
	 * @param string $salt The cryptographic salt used for hashing.
	 * @return string The resulting HMAC SHA-256 hash.
	 */
	public function calculate_hash( string $data, string $salt ): string {
		return \hash_hmac( 'sha256', $data, $salt );
	}
}
