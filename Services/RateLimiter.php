<?php
/**
 * PPADVP
 *
 * @package   PPADVP
 * @author    Dobrzepostawieni <contact@dobrzepostawieni.pl>
 * @copyright 2026 Dobrzepostawieni.pl
 * @license   GPL-3.0-or-later
 * @link      http://dobrzepostawieni.pl
 */

namespace PPADVP\Services;

// Prevent direct file access.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Class RateLimiter
 *
 * Handles request limiting based on IP address and action keys using Transients.
 */
class RateLimiter {

	/**
	 * Atomically reserves one attempt within the rate-limit window.
	 *
	 * @param string $action_key Unique key for the action.
	 * @param int    $seconds    Duration to keep the limit in seconds.
	 * @param int    $limit      Max allowed attempts.
	 * @return bool True when the attempt was reserved, false when limited.
	 */
	public function consume( string $action_key, int $seconds = 60, int $limit = 10 ): bool {
		$lock_name = $this->get_lock_name( $action_key );

		if ( ! $this->acquire_lock( $lock_name ) ) {
			return false;
		}

		try {
			if ( $this->is_limited( $action_key, $limit ) ) {
				return false;
			}

			$this->increment( $action_key, $seconds );

			return true;
		} finally {
			$this->release_lock( $lock_name );
		}
	}

	/**
	 * Releases one previously reserved attempt, for example after successful auth.
	 *
	 * @param string $action_key Unique key for the action.
	 * @param int    $seconds    Duration to keep the remaining counter.
	 */
	public function release( string $action_key, int $seconds = 60 ): void {
		$lock_name = $this->get_lock_name( $action_key );

		if ( ! $this->acquire_lock( $lock_name ) ) {
			return;
		}

		try {
			$transient_name = $this->get_transient_name( $action_key );
			$attempts       = (int) \get_transient( $transient_name );

			if ( $attempts <= 1 ) {
				\delete_transient( $transient_name );
				return;
			}

			\set_transient( $transient_name, $attempts - 1, $seconds );
		} finally {
			$this->release_lock( $lock_name );
		}
	}

	/**
	 * Checks if the action is currently rate limited for the user.
	 *
	 * @param string $action_key Unique key for the action (e.g., 'password_check').
	 * @param int    $limit      Max allowed attempts. Default 10.
	 * @return bool True if limit reached (blocked), false otherwise.
	 */
	public function is_limited( string $action_key, int $limit = 10 ): bool {
		$transient_name = $this->get_transient_name( $action_key );
		$attempts       = (int) \get_transient( $transient_name );

		return $attempts >= $limit;
	}

	/**
	 * Increments the attempt counter for the action using the public Transients API.
	 *
	 * @param string $action_key Unique key for the action.
	 * @param int    $seconds    Duration to keep the limit in seconds.
	 * Default 60 (1 min).
	 */
	public function increment( string $action_key, int $seconds = 60 ): void {
		$transient_name = $this->get_transient_name( $action_key );
		$attempts       = (int) \get_transient( $transient_name );

		\set_transient( $transient_name, $attempts + 1, $seconds );
	}

	/**
	 * Helper: Generates a unique transient name based on action and IP.
	 *
	 * @param string $action_key The action identifier.
	 * @return string The transient key.
	 */
	private function get_transient_name( string $action_key ): string {
		$ip = IpResolver::get_client_ip();

		// md5 used to keep the transient key short (limit is 172 chars, but shorter is better).
		return 'ppadvp_limit_' . \md5( $action_key . '_' . $ip );
	}

	/**
	 * Generates a short database advisory-lock name scoped to the current site.
	 *
	 * @param string $action_key The action identifier.
	 */
	private function get_lock_name( string $action_key ): string {
		return 'ppadvp_' . \md5( \get_current_blog_id() . '_' . $this->get_transient_name( $action_key ) );
	}

	/**
	 * Acquires the database advisory lock used to serialize counter updates.
	 *
	 * @param string $lock_name Advisory lock name.
	 */
	private function acquire_lock( string $lock_name ): bool {
		global $wpdb;

		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
		$acquired = $wpdb->get_var( $wpdb->prepare( 'SELECT GET_LOCK( %s, %d )', $lock_name, 5 ) );

		return 1 === (int) $acquired;
	}

	/**
	 * Releases a database advisory lock owned by this connection.
	 *
	 * @param string $lock_name Advisory lock name.
	 */
	private function release_lock( string $lock_name ): void {
		global $wpdb;

		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
		$wpdb->get_var( $wpdb->prepare( 'SELECT RELEASE_LOCK( %s )', $lock_name ) );
	}
}
