<?php
/**
 * Abstract Options Manager.
 *
 * Provides a standardized way to read, merge, and update plugin options.
 *
 * @package   PPADVP
 * @author    Dobrzepostawieni <contact@dobrzepostawieni.pl>
 * @copyright 2026 Dobrzepostawieni.pl
 * @license   GPL-3.0-or-later
 */

namespace PPADVP\Services\Abstracts;

// Prevent direct file access.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Class AbstractOptions
 */
abstract class AbstractOptions {

	/**
	 * Returns the database option name.
	 *
	 * @return string Option key.
	 */
	abstract public static function get_option_name(): string;

	/**
	 * Returns the default settings structure.
	 *
	 * @return array<string, mixed> Default settings.
	 */
	abstract public static function get_defaults(): array;

	/**
	 * Retrieves all raw settings merged with defaults (NO FILTERS).
	 * SAFE FOR SAVING TO DB.
	 *
	 * @return array<string, mixed> Full raw settings array.
	 */
	public static function get_raw(): array {
		$defaults = static::get_defaults();
		$settings = \get_option( static::get_option_name(), array() );

		if ( ! \is_array( $settings ) ) {
			$settings = array();
		}

		return \array_replace_recursive( $defaults, $settings );
	}

	/**
	 * Retrieves all settings merged with defaults and FILTERED by limits.
	 * SAFE FOR FRONTEND/UI READS ONLY.
	 *
	 * @return array<string, mixed> Full settings array.
	 */
	public static function get_all(): array {
		$raw_settings = static::get_raw();

		return static::filter_settings( $raw_settings );
	}

	/**
	 * Retrieves a specific setting value.
	 *
	 * @param string $key Setting key.
	 * @return mixed Setting value or null.
	 */
	public static function get( string $key ) {
		$settings = static::get_all();

		return $settings[ $key ] ?? null;
	}

	/**
	 * Updates a specific setting.
	 *
	 * @param string $key   Setting key.
	 * @param mixed  $value New value.
	 * @return bool True if updated, false if identical.
	 */
	public static function update( string $key, $value ): bool {
		$settings = static::get_raw();

		if ( \array_key_exists( $key, $settings ) && $settings[ $key ] === $value ) {
			return false;
		}

		$settings[ $key ] = $value;

		return \update_option( static::get_option_name(), $settings );
	}

	/**
	 * Hook method to filter settings after merging with defaults.
	 * Child classes can override this.
	 *
	 * @param array<string, mixed> $settings Merged settings.
	 * @return array<string, mixed> Filtered settings.
	 */
	protected static function filter_settings( array $settings ): array {
		return $settings;
	}
}
