<?php
/**
 * Sanitization Helpers Trait.
 *
 * @package    PPADVP
 * @author     Dobrzepostawieni <contact@dobrzepostawieni.pl>
 * @copyright  2026 Dobrzepostawieni.pl
 * @license    GPL-3.0-or-later
 */

namespace PPADVP\Services\Traits;

// Prevent direct file access.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Trait SanitizationHelpers
 */
trait SanitizationHelpers {

	/**
	 * Default max text length.
	 */
	protected static int $default_max_length = 255;

	/**
	 * Sanitizes an array of strings.
	 *
	 * @param mixed $items Input array.
	 * @return array<int, string> Sanitized array.
	 */
	protected static function sanitize_string_array( $items ): array {
		if ( ! \is_array( $items ) ) {
			return array();
		}

		return \array_values( \array_filter( \array_map( 'sanitize_text_field', $items ) ) );
	}

	/**
	 * Sanitizes and limits text length.
	 *
	 * @param string   $input      Input string.
	 * @param int|null $max_length Max length.
	 * @return string Sanitized string.
	 */
	protected static function sanitize_and_limit_text( string $input, ?int $max_length = null ): string {
		$clean = \sanitize_text_field( $input );
		$limit = $max_length ?? self::$default_max_length;

		return \mb_substr( $clean, 0, $limit, 'UTF-8' );
	}

	/**
	 * Helper function to ensure that a 'name' field in an entry array is strictly unique.
	 * Appends a numeric suffix (e.g. " (1)") if a duplicate is found.
	 *
	 * @param array<string, mixed> $entry      The array entry containing a 'name' key.
	 * @param array<string, bool>  $seen_names Reference to the tracking array.
	 * @return array<string, mixed> The modified entry.
	 */
	protected static function ensure_unique_name( array $entry, array &$seen_names ): array {
		$name            = isset( $entry['name'] ) ? (string) $entry['name'] : '';
		$normalized_name = \strtolower( \trim( $name ) );

		if ( '' === $normalized_name ) {
			return $entry;
		}

		if ( isset( $seen_names[ $normalized_name ] ) ) {
			$suffix   = 1;
			$new_name = $name . ' (' . $suffix . ')';

			while ( isset( $seen_names[ \strtolower( \trim( $new_name ) ) ] ) ) {
				++$suffix;
				$new_name = $name . ' (' . $suffix . ')';
			}

			$entry['name']   = $new_name;
			$normalized_name = \strtolower( \trim( $new_name ) );
		}

		$seen_names[ $normalized_name ] = true;

		return $entry;
	}
}
