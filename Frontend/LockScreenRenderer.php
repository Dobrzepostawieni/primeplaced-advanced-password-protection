<?php
/**
 * Lock Screen Renderer Class.
 *
 * Handles the server-side rendering of the password protection screen.
 *
 * @package    PPADVP
 * @author     Dobrzepostawieni <contact@dobrzepostawieni.pl>
 * @copyright  2026 Dobrzepostawieni.pl
 * @license    GPL-3.0-or-later
 */

namespace PPADVP\Frontend;

use PPADVP\Services\Options;

// Prevent direct file access.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Class LockScreenRenderer
 */
class LockScreenRenderer {

	/**
	 * Renders the lock screen view.
	 *
	 * @param string|null $error_message Optional error message to display.
	 */
	public function render( ?string $error_message = null ): void {
		$error_message ??= '';

		/**
		 * Allows external integrations to hijack the rendering process.
		 *
		 * @param bool   $is_handled    Whether the render was already handled.
		 * @param string $error_message The current error message.
		 */
		$is_handled = (bool) \apply_filters( 'ppadvp_pre_render_lock_screen', false, $error_message );

		if ( $is_handled ) {
			return;
		}

		$this->setup_hooks();
		$this->render_default_view( $error_message );
	}

	/**
	 * Sets up action hooks for the standalone template.
	 */
	private function setup_hooks(): void {
		\add_action( 'ppadvp_lock_screen_head', array( $this, 'render_head' ) );
		\add_action( 'ppadvp_lock_screen_head', 'wp_site_icon' );

		\add_action( 'ppadvp_lock_screen_body_open', array( $this, 'render_body_open' ) );
		\add_action( 'ppadvp_lock_screen_footer', array( $this, 'render_footer' ) );
	}

	/**
	 * Outputs scripts and styles for the <head> section.
	 */
	public function render_head(): void {
		if ( \is_admin_bar_showing() ) {
			global $wp_admin_bar;

			if ( ! \is_object( $wp_admin_bar ) ) {
				\_wp_admin_bar_init();
			}

			\wp_print_styles( array( 'admin-bar', 'dashicons' ) );

		}

		\wp_print_styles( \PPADVP_TEXTDOMAIN . '-public' );
	}

	/**
	 * Outputs content immediately after the opening <body> tag.
	 */
	public function render_body_open(): void {
		if ( \is_admin_bar_showing() ) {
			\wp_admin_bar_render();
		}
	}

	/**
	 * Outputs scripts for the footer.
	 */
	public function render_footer(): void {
		\wp_print_scripts( \PPADVP_TEXTDOMAIN . '-public' );

		if ( \is_admin_bar_showing() ) {
			\wp_print_scripts( 'admin-bar' );
		}
	}

	/**
	 * Renders the default PHP view.
	 *
	 * @param string $error_message Error message to display.
	 */
	protected function render_default_view( string $error_message ): void {
		$enqueue = new Enqueue();
		$enqueue->prepare_lockscreen_assets( $error_message );

		$view_path = \PPADVP_PLUGIN_ROOT . 'Frontend/views/lock-screen.php';

		if ( ! \file_exists( $view_path ) ) {
			return;
		}

		$ppadvp_page_title          = \__( 'Login', 'primeplaced-advanced-password-protection' );
		$ppadvp_charset             = \get_bloginfo( 'charset' );
		$ppadvp_is_admin_bar_active = \is_admin_bar_showing();
		$ppadvp_body_classes        = $ppadvp_is_admin_bar_active ? 'admin-bar' : '';

		if ( \ob_get_length() ) {
			\ob_clean();
		}

		if ( ! \headers_sent() ) {
			\nocache_headers();
		}

		require $view_path;
		exit;
	}
}
