<?php
/**
 * Cache Plugins Integration.
 *
 * Automatically purges popular caching plugins when protection settings are updated,
 * preventing stale public HTML from bypassing the lock screen.
 *
 * @package    PPADVP
 * @author     Dobrzepostawieni <contact@dobrzepostawieni.pl>
 * @copyright  2026 Dobrzepostawieni.pl
 * @license    GPL-3.0-or-later
 */

namespace PPADVP\Integrations;

// Prevent direct file access.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

use PPADVP\Engine\Base;
use PPADVP\Services\Options;

/**
 * Class CacheIntegration
 */
class CacheIntegration extends Base {

	/**
	 * Initialize the class and register hooks.
	 *
	 * @return bool True on success, false on failure.
	 */
	public function initialize(): bool {
		if ( ! parent::initialize() ) {
			return false;
		}

		// Listen only to explicit, authenticated administrator save actions.
		\add_action( 'ppadvp_admin_settings_explicitly_saved', array( $this, 'purge_all_cache' ) );

		\add_action( 'updated_post_meta', array( $this, 'purge_post_cache_on_meta_update' ), 10, 4 );
		\add_action( 'added_post_meta', array( $this, 'purge_post_cache_on_meta_update' ), 10, 4 );
		\add_action( 'deleted_post_meta', array( $this, 'purge_post_cache_on_meta_delete' ), 10, 4 );

		return true;
	}

	/**
	 * Clears global cache across popular caching plugins.
	 */
	public function purge_all_cache(): void {
		/**
		 * List of global cache purge functions from external plugins.
		 *
		 * @var string[] $external_functions
		 */
		$external_functions = array(
			'rocket_clean_domain',
			'w3tc_flush_all',
			'wp_cache_clear_cache',
			'sg_cachepress_purge_cache',
		);

		foreach ( $external_functions as $func ) {
			if ( \function_exists( $func ) && \is_callable( $func ) ) {
				\call_user_func( $func );
			}
		}

		$this->remove_w3_total_cache_stale_pages();

		// LiteSpeed Cache.
		if ( \defined( 'LSCWP_V' ) || \class_exists( 'LiteSpeed\\Purge' ) ) {
			// phpcs:ignore WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedHooknameFound -- LiteSpeed compatibility.
			\do_action( 'litespeed_purge_all' );
		}
		// Kinsta Cache.
		if ( \class_exists( 'Kinsta\\Cache' ) && ! empty( $GLOBALS['kinsta_cache'] ) ) {
			$GLOBALS['kinsta_cache']->purge_complete_all();
		}
		// Standard WP Object Cache.
		if ( \function_exists( 'wp_cache_flush' ) ) {
			\wp_cache_flush();
		}
	}

	/**
	 * Removes stale Disk: Enhanced pages retained by W3 Total Cache after its public flush.
	 */
	private function remove_w3_total_cache_stale_pages(): void {
		$cleaner_class     = 'W3TC\\Cache_File_Cleaner_Generic_HardDelete';
		$environment_class = 'W3TC\\Util_Environment';

		if (
			! \function_exists( 'w3tc_flush_all' )
			|| ! \defined( 'W3TC_CACHE_PAGE_ENHANCED_DIR' )
			|| ! \class_exists( $cleaner_class )
			|| ! \class_exists( $environment_class )
			|| ! \is_callable( array( $environment_class, 'blog_id' ) )
			) {
			return;
		}

		$cache_directory = \constant( 'W3TC_CACHE_PAGE_ENHANCED_DIR' );
		if ( ! \is_string( $cache_directory ) || '' === $cache_directory ) {
			return;
		}

		if ( 0 !== \call_user_func( array( $environment_class, 'blog_id' ) ) ) {
			if ( ! \is_callable( array( $environment_class, 'host' ) ) ) {
				return;
			}

			$cache_host = \call_user_func( array( $environment_class, 'host' ) );
			if (
				! \is_string( $cache_host )
				|| '' === $cache_host
				|| false !== \strpos( $cache_host, '/' )
				|| false !== \strpos( $cache_host, '\\' )
				|| \in_array( $cache_host, array( '.', '..' ), true )
			) {
				return;
			}

			$cache_directory .= \DIRECTORY_SEPARATOR . $cache_host;
		}

		$cleaner = new $cleaner_class(
			array(
				'cache_dir' => $cache_directory,
				'exclude'   => array( '.htaccess' ),
			)
		);

		if ( \is_callable( array( $cleaner, 'clean' ) ) ) {
			$cleaner->clean();
		}
	}

	/**
	 * Clears cache for a specific post when its local protection meta is added or updated.
	 *
	 * @param int    $meta_id    ID of updated metadata entry.
	 * @param int    $post_id    Post ID.
	 * @param string $meta_key   Meta key.
	 * @param mixed  $meta_value Meta value.
	 */
	public function purge_post_cache_on_meta_update( int $meta_id, int $post_id, string $meta_key, $meta_value ): void {
		$this->handle_post_cache_purge( $post_id, $meta_key );
	}

	/**
	 * Clears cache for a specific post when its local protection meta is deleted.
	 *
	 * @param array<int, string> $meta_ids   Array of deleted metadata entry IDs.
	 * @param int                $post_id    Post ID.
	 * @param string             $meta_key   Meta key.
	 * @param mixed              $meta_value Meta value.
	 */
	public function purge_post_cache_on_meta_delete( array $meta_ids, int $post_id, string $meta_key, $meta_value ): void {
		$this->handle_post_cache_purge( $post_id, $meta_key );
	}

	/**
	 * Processes the actual cache purge if the meta key matches plugin keys.
	 *
	 * @param int    $post_id  The ID of the post to purge.
	 * @param string $meta_key The meta key that was triggered.
	 */
	private function handle_post_cache_purge( int $post_id, string $meta_key ): void {
		$ppadvp_keys = array(
			'_ppadvp_is_protected',
			'_ppadvp_selected_template',
			'_ppadvp_selected_passwords',
		);

		if ( ! \in_array( $meta_key, $ppadvp_keys, true ) ) {
			return;
		}

		\clean_post_cache( $post_id );

		/**
		 * List of post-specific cache purge functions from external plugins.
		 *
		 * @var string[] $external_functions
		 */
		$external_functions = array(
			'rocket_clean_post',
			'w3tc_flush_post',
		);

		foreach ( $external_functions as $func ) {
			if ( \function_exists( $func ) && \is_callable( $func ) ) {
				\call_user_func( $func, $post_id );
			}
		}

		// LiteSpeed Cache.
		if ( \defined( 'LSCWP_V' ) || \class_exists( 'LiteSpeed\\Purge' ) ) {
			// phpcs:ignore WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedHooknameFound -- LiteSpeed compatibility.
			\do_action( 'litespeed_purge_post', $post_id );
		}
	}
}
