<?php
/**
 * Auth Cookie Strategy Interface.
 *
 * Defines the contract for handling authentication cookie naming and hashing.
 *
 * @package   PPADVP
 * @author    Dobrzepostawieni <contact@dobrzepostawieni.pl>
 * @copyright 2026 Dobrzepostawieni.pl
 * @license   GPL-3.0-or-later
 */

namespace PPADVP\Services\Interfaces;

// Prevent direct file access.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Interface AuthCookieStrategy
 */
interface AuthCookieStrategy {

	/**
	 * Determines the name of the cookie based on context.
	 *
	 * @param string     $default_name Default cookie name (e.g. site_access_token).
	 * @param int|string $object_id    The current object ID (post/term).
	 */
	public function get_cookie_name( string $default_name, $object_id ): string;

	/**
	 * Determines the hash suffix for salting the password based on context.
	 *
	 * @param int|string $object_id The current object ID.
	 */
	public function get_hash_suffix( $object_id ): string;
}
