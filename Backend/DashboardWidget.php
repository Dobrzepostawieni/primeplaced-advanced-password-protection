<?php
/**
 * Dashboard Widget Class.
 *
 * @package    PPADVP
 * @author     Dobrzepostawieni <contact@dobrzepostawieni.pl>
 * @copyright  2026 Dobrzepostawieni.pl
 * @license    GPL-3.0-or-later
 */

namespace PPADVP\Backend;

// Prevent direct file access.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

use PPADVP\Engine\Base;
use PPADVP\Integrations\Capabilities;
use PPADVP\Engine\Traits\AssetLoader;
use PPADVP\Engine\Traits\ScriptDataHelper;
use Inpsyde\Assets\Asset;
use Inpsyde\Assets\AssetManager;
use Inpsyde\Assets\Script;
use Inpsyde\Assets\Style;

/**
 * Adds a custom status widget to the WordPress Dashboard.
 */
class DashboardWidget extends Base {

	use AssetLoader;
	use ScriptDataHelper;

	/**
	 * Unique handle for the dashboard widget script.
	 */
	private const HANDLE = \PPADVP_TEXTDOMAIN . '-dashboard-widget';

	/**
	 * Initialize the widget and its translations.
	 *
	 * @return bool True on success.
	 */
	public function initialize(): bool {
		if ( ! parent::initialize() ) {
			return false;
		}

		\add_action( 'wp_dashboard_setup', array( $this, 'add_dashboard_widget' ) );
		\add_action( AssetManager::ACTION_SETUP, array( $this, 'enqueue_assets' ) );
		$this->setup_translations( self::HANDLE );

		return true;
	}

	/**
	 * Registers the widget with WordPress.
	 */
	public function add_dashboard_widget(): void {
		if ( ! Capabilities::current_user_can_manage_settings() ) {
			return;
		}

		$icon  = '<span class="dashicons dashicons-lock" style="color: #2271b1; vertical-align: text-bottom; margin-right: 5px;"></span>';
		$title = '<span>' . $icon . \esc_html( \PPADVP_NAME ) . '</span>';

		\wp_add_dashboard_widget( 'ppadvp_status_widget', $title, array( $this, 'render_widget_content' ) );
	}

	/**
	 * Enqueue assets when viewing the dashboard.
	 *
	 * @param AssetManager $asset_manager Manager instance.
	 */
	public function enqueue_assets( AssetManager $asset_manager ): void {
		$screen = \get_current_screen();

		if ( ! $screen || 'dashboard' !== $screen->id ) {
			return;
		}

		if ( ! Capabilities::current_user_can_manage_settings() ) {
			return;
		}

		$this->register_styles( $asset_manager );
		$this->register_scripts( $asset_manager );
	}

	/**
	 * Renders the React root container for the widget.
	 */
	public function render_widget_content(): void {
		echo '<div id="ppadvp-widget-root"></div>';
	}

	/**
	 * Registers widget styles.
	 *
	 * @param AssetManager $asset_manager Manager instance.
	 */
	private function register_styles( AssetManager $asset_manager ): void {
		$config = $this->get_asset_config();

		$style = new Style(
			self::HANDLE,
			\plugins_url( 'assets/build/primeplaced-advanced-password-protection-widget.css', \PPADVP_PLUGIN_ABSOLUTE )
		);

		$style->forLocation( Asset::BACKEND )
			->withVersion( $config['version'] )
			->dependencies();

		$asset_manager->register( $style );
	}

	/**
	 * Registers widget scripts.
	 *
	 * @param AssetManager $asset_manager Manager instance.
	 */
	private function register_scripts( AssetManager $asset_manager ): void {
		$config    = $this->get_asset_config();
		$safe_deps = \array_diff(
			$config['dependencies'],
			array( 'wp-edit-post', 'wp-editor', 'wp-block-editor', 'wp-block-library', 'wp-edit-site' )
		);

		$script = new Script(
			self::HANDLE,
			\plugins_url( 'assets/build/primeplaced-advanced-password-protection-widget.js', \PPADVP_PLUGIN_ABSOLUTE )
		);

		$script->forLocation( Asset::BACKEND )
			->withVersion( $config['version'] )
			->dependencies( ...\array_values( $safe_deps ) );

		$script->withLocalize( 'ppadvpAdminData', $this->get_script_data() );

		$asset_manager->register( $script );
	}

	/**
	 * Prepares data for the widget script.
	 *
	 * @return array<string, mixed>
	 */
	private function get_script_data(): array {
		$data = \array_merge(
			$this->get_admin_base_data(),
			array(
				'settings_url' => \admin_url( 'admin.php?page=' . \PPADVP_TEXTDOMAIN ),
			)
		);

		return (array) \apply_filters( 'ppadvp_widget_script_data', $data );
	}

	/**
	 * Helper: Reads the Webpack asset config.
	 *
	 * @return array{dependencies: string[], version: string}
	 */
	private function get_asset_config(): array {
		$path = \plugin_dir_path( \PPADVP_PLUGIN_ABSOLUTE ) . 'assets/build/primeplaced-advanced-password-protection-widget.asset.php';

		return $this->get_webpack_asset_config( $path, array( 'wp-element', 'wp-components', 'wp-i18n' ) );
	}
}
