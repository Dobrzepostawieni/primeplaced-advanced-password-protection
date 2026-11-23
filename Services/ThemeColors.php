<?php
/**
 * Theme Colors Helper Class.
 *
 * Retrieves and sanitizes the color palette from the active theme,
 * WordPress core, or falls back to the admin color scheme.
 *
 * @package   PPADVP
 * @author    Dobrzepostawieni <contact@dobrzepostawieni.pl>
 * @copyright 2026 Dobrzepostawieni.pl
 * @license   GPL-3.0-or-later
 */

namespace PPADVP\Services;

// Prevent direct file access.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Class ThemeColors
 */
class ThemeColors {

	/**
	 * Retrieves the color palette, falling back to admin colors if theme/core are empty.
	 *
	 * @return array<int, array{name: string, slug: string, color: string}> List of valid color configuration arrays.
	 */
	public static function get_hex_palette(): array {
		$core_colors  = self::get_global_settings_colors( 'core' );
		$theme_colors = self::get_global_settings_colors( 'theme' );

		$all_colors = \array_merge( $theme_colors, $core_colors );

		// Fallback to admin scheme if theme and core palettes are empty.
		if ( array() === $all_colors ) {
			$all_colors = self::get_admin_scheme_colors();
		}

		return self::filter_hex_colors( $all_colors );
	}

	/**
	 * Fetches color palette defined in theme.json via global settings.
	 *
	 * @param string $type The origin of colors to fetch ('theme' or 'core').
	 * @return array<int, array{name: string, slug: string, color: string}> Raw array of color configurations.
	 */
	private static function get_global_settings_colors( string $type ): array {
		if ( ! \function_exists( 'wp_get_global_settings' ) ) {
			return array();
		}

		$global_settings = \wp_get_global_settings();

		return (array) ( $global_settings['color']['palette'][ $type ] ?? array() );
	}

	/**
	 * Retrieves the current user's admin color scheme colors.
	 *
	 * @return array<int, array{name: string, slug: string, color: string}> Formatted array of admin scheme colors.
	 */
	private static function get_admin_scheme_colors(): array {
		global $_wp_admin_css_colors;

		$admin_color = (string) \get_user_option( 'admin_color' );

		if ( '' === $admin_color || '0' === $admin_color ) {
			$admin_color = 'fresh';
		}

		if ( empty( $_wp_admin_css_colors[ $admin_color ]->colors ) ) {
			return array();
		}

		$formatted_colors = array();
		$index            = 1;

		foreach ( $_wp_admin_css_colors[ $admin_color ]->colors as $color ) {
			$formatted_colors[] = array(
				/* translators: %d: Color index number */
				'name'  => \sprintf( \__( 'Admin Color %d', 'primeplaced-advanced-password-protection' ), $index ),
				'slug'  => 'admin-color-' . $index,
				'color' => (string) $color,
			);
			++$index;
		}

		return $formatted_colors;
	}

	/**
	 * Filters an array of color definitions, keeping only valid HEX formats.
	 *
	 * @param array<int, mixed> $colors Array of color definitions.
	 * @return array<int, array{name: string, slug: string, color: string}> Filtered array.
	 */
	private static function filter_hex_colors( array $colors ): array {
		$valid_colors = array();

		foreach ( $colors as $color ) {
			if ( ! \is_array( $color ) ) {
				continue;
			}

			if ( empty( $color['color'] ) ) {
				continue;
			}

			$sanitized_color = \sanitize_hex_color( (string) $color['color'] );
			if ( null === $sanitized_color ) {
				continue;
			}
			if ( false === $sanitized_color ) {
				continue;
			}

			$color['color'] = $sanitized_color;

			$valid_colors[] = array(
				'name'  => isset( $color['name'] ) ? (string) $color['name'] : '',
				'slug'  => isset( $color['slug'] ) ? (string) $color['slug'] : '',
				'color' => (string) $color['color'],
			);
		}

		return $valid_colors;
	}
}
