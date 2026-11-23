<?php
/**
 * Script Data Helper Trait.
 *
 * Provides shared utility methods for preparing base localized JavaScript data.
 *
 * @package    PPADVP
 * @author     Dobrzepostawieni <contact@dobrzepostawieni.pl>
 * @copyright  2026 Dobrzepostawieni.pl
 * @license    GPL-3.0-or-later
 */

namespace PPADVP\Engine\Traits;

// Prevent direct file access.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

use PPADVP\Integrations\Capabilities;

/**
 * Trait ScriptDataHelper
 */
trait ScriptDataHelper {

	/**
	 * Returns the foundational data required by almost all React apps in the plugin.
	 *
	 * @return array<string, mixed> Base script data array.
	 */
	protected function get_common_data(): array {
		return array(
			'rest_url'    => \esc_url_raw( \rest_url( \PPADVP_API_NAMESPACE ) ),
			'nonce'       => \wp_create_nonce( 'wp_rest' ),
			'active_plan' => 'free',
		);
	}

	/**
	 * Returns the foundational data required by backend/admin React apps.
	 *
	 * @return array<string, mixed> Base script data array.
	 */
	protected function get_admin_base_data(): array {
		return \array_merge(
			$this->get_common_data(),
			array(
				'can_manage_settings' => Capabilities::current_user_can_manage_settings(),
				'is_premium'          => false,
				'has_fs_error'        => false,
			)
		);
	}

	/**
	 * Returns the safe, restricted data required by frontend React apps.
	 *
	 * @return array<string, mixed> Base public script data array.
	 */
	protected function get_frontend_base_data(): array {
		return $this->get_common_data();
	}
}
