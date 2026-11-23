<?php
/**
 * Cookie Strategy.
 *
 * Standard implementation for the plugin (Free/Core version).
 * Handles global protection logic (one cookie for the whole site).
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

use PPADVP\Services\Interfaces\AuthCookieStrategy;

/**
 * Class CookieStrategy
 */
class CookieStrategy implements AuthCookieStrategy {

	/**
	 * Returns the default cookie name unmodified.
	 *
	 * @param string     $default_name Default cookie name.
	 * @param int|string $object_id    Context ID (unused in standard version).
	 */
	public function get_cookie_name( string $default_name, $object_id ): string {
		return $default_name;
	}

	/**
	 * Returns an empty suffix (global hash).
	 *
	 * @param int|string $object_id Context ID (unused in standard version).
	 */
	public function get_hash_suffix( $object_id ): string {
		return '';
	}
}
