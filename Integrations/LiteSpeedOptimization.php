<?php
/**
 * LiteSpeed Page Optimization integration.
 *
 * @package    PPADVP
 * @author     Dobrzepostawieni <contact@dobrzepostawieni.pl>
 * @copyright 2026 Dobrzepostawieni.pl
 * @license    GPL-3.0-or-later
 */

namespace PPADVP\Integrations;

// Prevent direct file access.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

use PPADVP\Engine\Base;

/**
 * Excludes lock-screen assets from LiteSpeed JavaScript optimization.
 */
class LiteSpeedOptimization extends Base {

	/**
	 * JavaScript strings matched by LiteSpeed's exclusion lists.
	 *
	 * @var string[]
	 */
	private const LOCKSCREEN_EXCLUDES = array(
		'primeplaced-advanced-password-protection-public.js',
		'window.ppadvpFrontData',
	);

	/**
	 * Initialize the LiteSpeed integration.
	 *
	 * The filters are safe to register when LiteSpeed Cache is inactive. WordPress
	 * simply does not apply them until LiteSpeed Cache uses the matching hooks.
	 *
	 * @return bool True on success.
	 */
	public function initialize(): bool {
		if ( ! parent::initialize() ) {
			return false;
		}

		// phpcs:ignore WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedHooknameFound -- LiteSpeed compatibility.
		\add_filter( 'litespeed_optimize_js_excludes', array( $this, 'exclude_lockscreen_assets' ), 20 );
		// phpcs:ignore WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedHooknameFound -- LiteSpeed compatibility.
		\add_filter( 'litespeed_optm_js_defer_exc', array( $this, 'exclude_lockscreen_assets' ), 20 );
		// phpcs:ignore WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedHooknameFound -- LiteSpeed compatibility.
		\add_filter( 'litespeed_optm_gm_js_exc', array( $this, 'exclude_lockscreen_assets' ), 20 );

		return true;
	}

	/**
	 * Appends lock-screen asset identifiers without altering existing exclusions.
	 *
	 * @param string[] $excludes LiteSpeed exclusions collected from other integrations.
	 * @return string[] Exclusions including the PPADVP lock-screen assets.
	 */
	public function exclude_lockscreen_assets( array $excludes ): array {
		foreach ( self::LOCKSCREEN_EXCLUDES as $exclude ) {
			if ( ! \in_array( $exclude, $excludes, true ) ) {
				$excludes[] = $exclude;
			}
		}

		return $excludes;
	}
}
