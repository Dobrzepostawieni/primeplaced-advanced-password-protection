<?php
/**
 * Enqueue Class (Frontend).
 *
 * @package    PPADVP
 * @author     Dobrzepostawieni <contact@dobrzepostawieni.pl>
 * @copyright  2026 Dobrzepostawieni.pl
 * @license    GPL-3.0-or-later
 */

namespace PPADVP\Frontend;

// Prevent direct file access.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

use PPADVP\Engine\Base;
use PPADVP\Engine\Traits\AssetLoader;
use PPADVP\Engine\Traits\ScriptDataHelper;
use PPADVP\Services\Options;
use Inpsyde\Assets\AssetManager;

/**
 * Handles asset registration for the frontend lock screen.
 */
class Enqueue extends Base {

	use AssetLoader;
	use ScriptDataHelper;

	/**
	 * Unique handle for public assets.
	 */
	private const HANDLE = \PPADVP_TEXTDOMAIN . '-public';

	/**
	 * Initialize the class and configure translations.
	 *
	 * @return bool True on success.
	 */
	public function initialize(): bool {
		if ( ! parent::initialize() ) {
			return false;
		}

		\add_action( AssetManager::ACTION_SETUP, array( $this, 'enqueue_assets' ) );
		$this->setup_translations( self::HANDLE );

		return true;
	}

	/**
	 * Enqueue assets via Manager (Required by Inpsyde contract).
	 */
	public function enqueue_assets(): void {
		// Public scripts for normal pages if needed.
	}

	/**
	 * Manually prepares assets for the standalone lock screen.
	 *
	 * @param string $error_message Optional error message to pass to JS.
	 */
	public function prepare_lockscreen_assets( string $error_message = '' ): void {
		$plugin_url   = \plugin_dir_url( \PPADVP_PLUGIN_ABSOLUTE );
		$plugin_dir   = \plugin_dir_path( \PPADVP_PLUGIN_ABSOLUTE );
		$asset_config = $this->get_asset_config( $plugin_dir );

		\wp_enqueue_style(
			self::HANDLE,
			$plugin_url . 'assets/build/primeplaced-advanced-password-protection-public.css',
			array(),
			$asset_config['version']
		);

		\wp_enqueue_script(
			self::HANDLE,
			$plugin_url . 'assets/build/primeplaced-advanced-password-protection-public.js',
			$asset_config['dependencies'],
			$asset_config['version'],
			true
		);

		$this->set_script_translations_for_handle( self::HANDLE );

		$data          = $this->get_script_data( $error_message );
		$inline_script = 'window.ppadvpFrontData = ' . \wp_json_encode( $data ) . ';';

		\wp_add_inline_script( self::HANDLE, $inline_script, 'before' );

		\do_action( 'ppadvp_enqueue_public_assets' );
	}

	/**
	 * Retrieves frontend-specific data.
	 *
	 * @param string $external_error Potential login error.
	 * @return array<string, mixed>
	 */
	private function get_script_data( string $external_error = '' ): array {
		$cookie_type = Options::get( 'cookie_type' );

		$data = \array_merge(
			$this->get_frontend_base_data(),
			array(
				'design_settings' => $this->get_visual_settings(),
				'error_msg'       => ! empty( $external_error ) ? $external_error : false,
				'object_id'       => \get_queried_object_id(),
				'object_type'     => $this->get_current_object_type(),
				'cookie_type'     => \is_string( $cookie_type ) ? $cookie_type : '',
			)
		);

		return (array) \apply_filters( 'ppadvp_front_script_data', $data );
	}

	/**
	 * Fetches visual/logo settings for the lock screen.
	 *
	 * @return array<string, mixed>
	 */
	private function get_visual_settings(): array {
		$design_settings = Options::get( 'design_settings' );
		$design_settings = \is_array( $design_settings ) ? $design_settings : array();

		$logo_url = '';
		if ( ! empty( $design_settings['logoId'] ) && \is_scalar( $design_settings['logoId'] ) ) {
			$img = \wp_get_attachment_image_url( (int) $design_settings['logoId'], 'full' );
			if ( \is_string( $img ) ) {
				$logo_url = $img;
			}
		}
		$design_settings['logoUrl'] = $logo_url;

		return $design_settings;
	}

	/**
	 * Reads Webpack asset configuration for public files.
	 *
	 * @param string $plugin_dir Base directory.
	 * @return array{dependencies: string[], version: string}
	 */
	private function get_asset_config( string $plugin_dir ): array {
		$path = $plugin_dir . 'assets/build/primeplaced-advanced-password-protection-public.asset.php';
		return $this->get_webpack_asset_config( $path, array( 'wp-element', 'wp-i18n' ) );
	}

	/**
	 * Identifies the current WordPress object type.
	 *
	 * @return string Type (term|post|unknown).
	 */
	private function get_current_object_type(): string {
		if ( \is_category() || \is_tag() || \is_tax() ) {
			return 'term';
		}
		return \is_singular() ? 'post' : 'unknown';
	}
}
