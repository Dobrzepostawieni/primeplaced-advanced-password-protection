<?php
/**
 * PPADVP
 *
 * @package    PPADVP
 * @author     Dobrzepostawieni <contact@dobrzepostawieni.pl>
 * @copyright  2026 Dobrzepostawieni.pl
 * @license   GPL-3.0-or-later
 * @link       http://dobrzepostawieni.pl
 */

namespace PPADVP\Services;

// Prevent direct file access.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Class Encryption
 *
 * Handles two-way encryption for passwords allowing admin preview.
 * Uses hexadecimal encoding to prevent PHPCS obfuscation warnings.
 */
class Encryption {

	/**
	 * Encryption method.
	 */
	private const METHOD = 'AES-256-CBC';

	/**
	 * Separator for IV and Data.
	 */
	private const SEPARATOR = '::';

	/**
	 * Length of the SHA-256 authentication tag in hexadecimal characters.
	 */
	private const AUTH_TAG_HEX_LENGTH = 64;

	/**
	 * Encrypts a string using authenticated encrypt-then-MAC.
	 *
	 * @param string $password Plain text string.
	 * @return string Encrypted string (hexadecimal).
	 */
	public static function encrypt( string $password ): string {
		if ( '' === $password ) {
			return '';
		}

		if ( null !== self::decode_authenticated_payload( $password ) ) {
			return $password;
		}

		$legacy_payload = self::decode_legacy_payload( $password );
		if ( null !== $legacy_payload ) {
			$legacy_plaintext = self::decrypt_payload( $legacy_payload );
			if ( false === $legacy_plaintext ) {
				return $password;
			}

			$password = $legacy_plaintext;
		}

		$iv_length = \openssl_cipher_iv_length( self::METHOD );

		if ( false === $iv_length ) {
			return $password;
		}

		$iv = \openssl_random_pseudo_bytes( $iv_length );

		if ( false === $iv ) {
			return $password;
		}

		$encrypted = \openssl_encrypt( $password, self::METHOD, self::get_stable_key(), \OPENSSL_RAW_DATA, $iv );

		if ( false === $encrypted ) {
			return $password;
		}

		$encrypted_hex = \bin2hex( $encrypted );
		$iv_hex        = \bin2hex( $iv );
		$auth_tag      = self::create_authentication_tag( $encrypted, $iv );

		return $encrypted_hex . self::SEPARATOR . $iv_hex . self::SEPARATOR . $auth_tag;
	}

	/**
	 * Decrypts a string previously encrypted by this service.
	 *
	 * @param string $password Encrypted string (hexadecimal).
	 * @return string Plain text string.
	 */
	public static function decrypt( string $password ): string {
		if ( '' === $password ) {
			return '';
		}

		$payload = self::decode_authenticated_payload( $password );

		if ( null !== $payload ) {
			$expected_tag = self::create_authentication_tag( $payload['data'], $payload['iv'] );
			if ( ! \hash_equals( $expected_tag, $payload['auth_tag'] ) ) {
				return $password;
			}

			$decrypted = self::decrypt_payload( $payload );
			return ( false !== $decrypted ) ? $decrypted : $password;
		}

		$legacy_payload = self::decode_legacy_payload( $password );
		if ( null === $legacy_payload ) {
			return $password;
		}

		$decrypted = self::decrypt_payload( $legacy_payload );

		return ( false !== $decrypted ) ? $decrypted : $password;
	}

	/**
	 * Creates an authentication tag over the ciphertext and IV with a derived key.
	 *
	 * @param string $encrypted Raw encrypted bytes.
	 * @param string $iv        Raw initialization vector bytes.
	 * @return string Hexadecimal HMAC-SHA256 tag.
	 */
	private static function create_authentication_tag( string $encrypted, string $iv ): string {
		$auth_key = \hash( 'sha256', self::get_stable_key() . 'ppadvp_ciphertext_auth_v2', true );

		return \hash_hmac( 'sha256', $encrypted . $iv, $auth_key );
	}

	/**
	 * Decrypts a decoded AES-CBC payload.
	 *
	 * @param array{data: string, iv: string} $payload Decoded payload.
	 * @return string|false Plain text or false when OpenSSL rejects the payload.
	 */
	private static function decrypt_payload( array $payload ) {
		return \openssl_decrypt(
			$payload['data'],
			self::METHOD,
			self::get_stable_key(),
			\OPENSSL_RAW_DATA,
			$payload['iv']
		);
	}

	/**
	 * Decodes the current ciphertext, IV and authentication-tag envelope.
	 *
	 * @param string $password Encrypted string.
	 * @return array{data: string, iv: string, auth_tag: string}|null Decoded payload or null.
	 */
	private static function decode_authenticated_payload( string $password ): ?array {
		$parts = \explode( self::SEPARATOR, $password );

		if ( 3 !== \count( $parts ) ) {
			return null;
		}

		[$encrypted_hex, $iv_hex, $auth_tag] = $parts;

		if (
			! \ctype_xdigit( $encrypted_hex )
			|| ! \ctype_xdigit( $iv_hex )
			|| self::AUTH_TAG_HEX_LENGTH !== \strlen( $auth_tag )
			|| ! \ctype_xdigit( $auth_tag )
		) {
			return null;
		}

		$payload = self::decode_hex_payload( $encrypted_hex, $iv_hex );
		if ( null === $payload ) {
			return null;
		}

		$payload['auth_tag'] = \strtolower( $auth_tag );

		return $payload;
	}

	/**
	 * Decodes the legacy unauthenticated ciphertext and IV envelope.
	 *
	 * Existing values remain readable and are upgraded by encrypt() on their next
	 * persistence cycle.
	 *
	 * @param string $password Encrypted string.
	 * @return array{data: string, iv: string}|null Decoded payload or null.
	 */
	private static function decode_legacy_payload( string $password ): ?array {
		$parts = \explode( self::SEPARATOR, $password );

		if ( 2 !== \count( $parts ) ) {
			return null;
		}

		[$encrypted_hex, $iv_hex] = $parts;

		if ( ! \ctype_xdigit( $encrypted_hex ) || ! \ctype_xdigit( $iv_hex ) ) {
			return null;
		}

		return self::decode_hex_payload( $encrypted_hex, $iv_hex );
	}

	/**
	 * Strictly decodes shared hexadecimal ciphertext and IV fields.
	 *
	 * @param string $encrypted_hex Ciphertext in hexadecimal form.
	 * @param string $iv_hex        Initialization vector in hexadecimal form.
	 * @return array{data: string, iv: string}|null Decoded payload or null.
	 */
	private static function decode_hex_payload( string $encrypted_hex, string $iv_hex ): ?array {
		$iv_length = \openssl_cipher_iv_length( self::METHOD );
		if ( false === $iv_length || \strlen( $iv_hex ) !== $iv_length * 2 ) {
			return null;
		}

		$data = \hex2bin( $encrypted_hex );
		$iv   = \hex2bin( $iv_hex );

		if ( false === $data || false === $iv ) {
			return null;
		}

		return array(
			'data' => $data,
			'iv'   => $iv,
		);
	}

	/**
	 * Retrieves a stable encryption key.
	 *
	 * Prioritizes wp-config.php constant for Enterprise security, falls back to DB option.
	 *
	 * @return string The encryption key.
	 */
	private static function get_stable_key(): string {
		if ( \defined( 'PPADVP_ENCRYPTION_KEY' ) ) {
			$constant_key = \constant( 'PPADVP_ENCRYPTION_KEY' );
			if ( \is_string( $constant_key ) && '' !== $constant_key ) {
				return \hash( 'sha256', $constant_key . 'ppadvp_static_salt_v1' );
			}
		}

		$db_key = (string) \get_option( 'ppadvp_site_hash' );

		if ( '' === $db_key || '0' === $db_key ) {
			$db_key = \wp_generate_password( 64, true, true );
			\update_option( 'ppadvp_site_hash', $db_key );
		}

		return \hash( 'sha256', $db_key . 'ppadvp_static_salt_v1' );
	}
}
