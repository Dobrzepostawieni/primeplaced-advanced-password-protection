<?php
/**
 * Data Sanitizer Service.
 *
 * Provides methods to clean and normalize plugin settings.
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

use PPADVP\Services\Traits\SanitizationHelpers;

/**
 * Class Sanitizer
 */
class Sanitizer {
	use SanitizationHelpers;

	/**
	 * Sanitizes the main settings array.
	 * Processes only the keys present in the input to support partial updates (PATCH).
	 *
	 * @param array<string, mixed> $params Raw input parameters.
	 * @return array<string, mixed> Sanitized settings array.
	 */
	public static function sanitize_general_options( array $params ): array {
		$output = array();

		if ( \array_key_exists( 'protection', $params ) ) {
			$output['protection'] = (bool) $params['protection'];
		}

		if ( \array_key_exists( 'cookie_type', $params ) ) {
			$cookie_type   = \sanitize_key( (string) $params['cookie_type'] );
			$session_types = (array) \apply_filters( 'ppadvp_session_cookie_types', array( 'session' ) );
			$allowed_types = (array) \apply_filters(
				'ppadvp_allowed_cookie_types',
				\array_merge( array( 'duration' ), $session_types )
			);

			$output['cookie_type'] = \in_array( $cookie_type, $allowed_types, true ) ? $cookie_type : 'duration';
		}

		if ( \array_key_exists( 'cookie_days', $params ) ) {
			$output['cookie_days'] = \min( 365, \max( 1, \absint( $params['cookie_days'] ) ) );
		}

		if ( \array_key_exists( 'session_salt', $params ) ) {
			$session_salt = self::sanitize_session_salt( (string) $params['session_salt'] );

			$output['session_salt'] = '' !== $session_salt ? $session_salt : \wp_generate_password( 64, true, true );
		}

		if ( \array_key_exists( 'design_settings', $params ) ) {
			$output['design_settings'] = self::clean_design_settings( (array) $params['design_settings'] );
		}

		if ( \array_key_exists( 'password', $params ) ) {
			if ( \is_array( $params['password'] ) && ! empty( $params['password'] ) ) {
				$output['password'] = self::clean_password_entry( $params['password'] );
			} else {
				$output['password'] = null;
			}
		}

		return $output;
	}

	/**
	 * Sanitizes the opaque token-invalidating salt without treating its entropy
	 * characters as display markup.
	 *
	 * @param string $session_salt Candidate salt.
	 * @return string Safe salt value limited to 64 bytes.
	 */
	private static function sanitize_session_salt( string $session_salt ): string {
		$without_control_characters = \preg_replace( '/[\x00-\x1F\x7F]/', '', $session_salt );

		return \is_string( $without_control_characters ) ? \substr( $without_control_characters, 0, 64 ) : '';
	}

	/**
	 * Sanitizes a password entry and resolves author data without destroying omitted keys.
	 *
	 * @param array<string, mixed> $item Raw entry data.
	 * @return array<string, mixed>
	 */
	private static function clean_password_entry( array $item ): array {
		$item             = \apply_filters( 'ppadvp_before_sanitize_password_entry', $item );
		$current_settings = Options::get_raw();
		$current_pwd      = (array) ( $current_settings['password'] ?? array() );

		$merged = \array_merge( $current_pwd, $item );
		$author = self::resolve_author_data( $merged );

		$entry = array(
			'id'          => self::sanitize_and_limit_text( (string) ( $merged['id'] ?? '' ), 64 ),
			'name'        => self::sanitize_and_limit_text( (string) ( $merged['name'] ?? '' ) ),
			'password'    => \trim( (string) ( $merged['password'] ?? '' ) ),
			'is_active'   => (bool) ( $merged['is_active'] ?? true ),
			'author_id'   => $author['id'],
			'author_name' => $author['name'],
			'author_role' => $author['role'],
		);

		return (array) \apply_filters( 'ppadvp_sanitize_password_entry_data', $entry, $item );
	}

	/**
	 * Resolves and validates author information.
	 *
	 * @param array<string, mixed> $entry Input entry data.
	 * @return array{id: int, name: string, role: string} Resolved author data.
	 */
	private static function resolve_author_data( array $entry ): array {
		$id   = \absint( $entry['author_id'] ?? 0 );
		$name = \sanitize_text_field( $entry['author_name'] ?? '' );
		$role = \sanitize_key( (string) ( $entry['author_role'] ?? '' ) );

		if ( 0 === $id ) {
			$user = \wp_get_current_user();
			if ( $user->exists() ) {
				$id   = (int) $user->ID;
				$name = (string) $user->display_name;
				$role = ! empty( $user->roles ) ? (string) \reset( $user->roles ) : '';
			}
		}

		return array(
			'id'   => $id,
			'name' => $name,
			'role' => $role,
		);
	}

	/**
	 * Sanitizes design settings using a whitelist and prevents data wipe on partial updates.
	 *
	 * @param array<string, mixed> $input Raw design input.
	 * @return array<string, mixed> Sanitized design array.
	 */
	public static function clean_design_settings( array $input ): array {
		$current_settings = Options::get_raw();
		$current_design   = (array) ( $current_settings['design_settings'] ?? array() );
		$defaults         = Options::get_defaults();
		$structure        = (array) ( $defaults['design_settings'] ?? array() );
		$sanitized        = array();

		foreach ( $structure as $key => $default_value ) {
			$val               = $input[ $key ] ?? ( $current_design[ $key ] ?? $default_value );
			$sanitized[ $key ] = self::sanitize_single_design_value( (string) $key, $val, $default_value );
		}

		return $sanitized;
	}

	/**
	 * Helper to sanitize individual design properties.
	 *
	 * @param string $key           Setting key.
	 * @param mixed  $value         Input value.
	 * @param mixed  $default_value Default fallback.
	 * @return mixed Sanitized value.
	 */
	private static function sanitize_single_design_value( string $key, $value, $default_value ) {
		if ( \is_array( $default_value ) ) {
			return self::sanitize_array_value( $value, $default_value );
		}
		if ( \is_string( $default_value ) ) {
			return self::sanitize_string_value( $key, $value, $default_value );
		}
		if ( \is_bool( $default_value ) ) {
			return \filter_var( $value, \FILTER_VALIDATE_BOOLEAN );
		}
		if ( \is_int( $default_value ) ) {
			return \intval( $value );
		}

		return self::sanitize_and_limit_text( (string) $value );
	}

	/**
	 * Recursively sanitizes nested design arrays.
	 *
	 * @param mixed                $value         Input value.
	 * @param array<string, mixed> $default_value Default structure.
	 * @return array<string, mixed> Sanitized array.
	 */
	private static function sanitize_array_value( $value, array $default_value ): array {
		if ( ! \is_array( $value ) ) {
			return $default_value;
		}

		$sanitized = array();
		foreach ( $default_value as $sub_key => $sub_default ) {
			$sub_val               = $value[ $sub_key ] ?? $sub_default;
			$sanitized[ $sub_key ] = self::sanitize_single_design_value( (string) $sub_key, $sub_val, $sub_default );
		}

		return $sanitized;
	}

	/**
	 * Sanitizes strings with specific handling for colors and HTML.
	 *
	 * @param string $key           Setting key.
	 * @param mixed  $value         Input value.
	 * @param string $default_value Default fallback.
	 * @return string Sanitized string.
	 */
	private static function sanitize_string_value( string $key, $value, string $default_value ): string {
		$val = (string) $value;

		if ( 0 === \strpos( $val, '#' ) ) {
			$color = \sanitize_hex_color( $val );
			return $color ? \strtoupper( $color ) : \strtoupper( $default_value );
		}

		if ( \in_array( $key, array( 'desc', 'errorMsg' ), true ) ) {
			$allowed = array(
				'a'      => array(
					'href'   => true,
					'title'  => true,
					'target' => true,
				),
				'b'      => array(),
				'strong' => array(),
				'i'      => array(),
				'em'     => array(),
				'br'     => array(),
				'span'   => array(
					'class' => true,
					'style' => true,
				),
			);
			return \wp_kses( $val, $allowed );
		}

		return self::sanitize_and_limit_text( $val );
	}
}
