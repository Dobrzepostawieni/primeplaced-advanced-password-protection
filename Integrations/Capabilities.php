<?php
/**
 * Capabilities Integration (Core).
 *
 * Handles base permissions for the free version.
 * Disconnects the plugin's access from the global 'manage_options' capability.
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

/**
 * Class Capabilities
 */
class Capabilities extends Base {

	/**
	 * Capability required to access global settings (Menu).
	 */
	public const CAP_MANAGE_SETTINGS = 'manage_ppadvp_settings';

	/**
	 * Capability required to protect specific content.
	 */
	public const CAP_MANAGE_CONTENT_PROTECTION = 'manage_ppadvp_content_protection';

	/**
	 * Initialize the class and register hooks.
	 *
	 * @return bool True on success, false on failure.
	 */
	public function initialize(): bool {
		if ( ! parent::initialize() ) {
			return false;
		}

		\add_filter( 'user_has_cap', array( $this, 'map_core_permissions' ), 10, 2 );

		return true;
	}

	/**
	 * Grants basic plugin capability to administrators.
	 *
	 * @param array<string, bool> $allcaps All capabilities of the user.
	 * @param array<int, string>  $caps    Requested capabilities.
	 * @return array<string, bool> Modified capabilities.
	 */
	public function map_core_permissions( array $allcaps, array $caps ): array {
		if ( ! empty( $allcaps['manage_options'] ) ) {
			$allcaps[ self::CAP_MANAGE_SETTINGS ]           = true;
			$allcaps[ self::CAP_MANAGE_CONTENT_PROTECTION ] = true;
		}

		return $allcaps;
	}

	/**
	 * Checks if the current user can manage global plugin settings (Admin).
	 *
	 * @return bool True if the user has the required capability.
	 */
	public static function current_user_can_manage_settings(): bool {
		return \current_user_can( self::CAP_MANAGE_SETTINGS );
	}

	/**
	 * Helper: Check if current user can protect content.
	 *
	 * @return bool True if the user has the required capability.
	 */
	public static function current_user_can_protect_content(): bool {
		return \current_user_can( self::CAP_MANAGE_CONTENT_PROTECTION );
	}
}
