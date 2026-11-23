<?php
/**
 * Settings Page Class.
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

/**
 * Create the settings page in the backend.
 */
class SettingsPage extends Base {


	/**
	 * Initialize the class.
	 *
	 * @return bool True on success, false on failure.
	 */
	public function initialize(): bool {
		if ( ! parent::initialize() ) {
			return false;
		}

		\add_action( 'admin_menu', array( $this, 'add_plugin_admin_menu' ) );
		\add_action( 'admin_menu', array( $this, 'fix_submenu_order' ), 100 );

		\add_filter( 'admin_title', array( $this, 'filter_global_admin_title' ), 10, 2 );

		return true;
	}

	/**
	 * Register the administration menu.
	 */
	public function add_plugin_admin_menu(): void {
		$menu_icon = \plugins_url( 'assets/images/ppadvp-icon-logo.svg', \PPADVP_PLUGIN_ABSOLUTE );

		\add_menu_page(
			\__( 'Settings', 'primeplaced-advanced-password-protection' ),
			'Password Protect',
			Capabilities::CAP_MANAGE_CONTENT_PROTECTION,
			\PPADVP_TEXTDOMAIN,
			array( $this, 'display_plugin_admin_page' ),
			$menu_icon,
			90
		);

		\add_submenu_page(
			\PPADVP_TEXTDOMAIN,
			\__( 'Settings', 'primeplaced-advanced-password-protection' ),
			\__( 'Settings', 'primeplaced-advanced-password-protection' ),
			Capabilities::CAP_MANAGE_SETTINGS,
			\PPADVP_TEXTDOMAIN,
			array( $this, 'display_plugin_admin_page' )
		);
	}

	/**
	 * Render the settings page view.
	 * Uses an output buffer internally to ensure it renders EXACTLY
	 * where WordPress wants it (inside #wpbody-content), preventing HTML breaking.
	 */
	public function display_plugin_admin_page(): void {

		$has_valid_session = \is_user_logged_in() && ( \current_user_can( Capabilities::CAP_MANAGE_SETTINGS ) || \current_user_can( Capabilities::CAP_MANAGE_CONTENT_PROTECTION ) );

		if ( ! $has_valid_session ) {
			$this->render_fallback_login_form();
			return;
		}

		$view_path = \PPADVP_PLUGIN_ROOT . 'Backend/views/admin.php';

		if ( ! \file_exists( $view_path ) ) {
			return;
		}

		\ob_start();

		include $view_path;

		// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
		echo \ob_get_clean();
	}

	/**
	 * Renders a fallback login form if the REST API cookie is missing.
	 */
	private function render_fallback_login_form(): void {
		\wp_enqueue_style( 'login' );

		echo \wp_kses_post( '<div class="wrap">' );
		echo \wp_kses_post( '<div class="login" id="login">' );
		echo \wp_kses_post( '<h1>' . \esc_html( \PPADVP_NAME ) . '</h1>' );

		\wp_admin_notice(
			\__( 'Your session has expired. Please log in to continue where you left off.', 'primeplaced-advanced-password-protection' ),
			array( 'type' => 'error' )
		);

		\wp_login_form(
			array(
				'echo' => true,
			)
		);

		echo \wp_kses_post( '</div>' );
		echo \wp_kses_post( '</div>' );
	}

	/**
	 * Fixes the submenu order.
	 */
	public function fix_submenu_order(): void {
		global $submenu;

		if ( ! isset( $submenu[ \PPADVP_TEXTDOMAIN ] ) ) {
			return;
		}

		$items         = $submenu[ \PPADVP_TEXTDOMAIN ];
		$settings_item = null;
		$other_items   = array();

		foreach ( $items as $item ) {
			if ( \PPADVP_TEXTDOMAIN === $item[2] && null === $settings_item ) {
				$settings_item = $item;
			} elseif ( \PPADVP_TEXTDOMAIN !== $item[2] ) {
				$other_items[] = $item;
			}
		}

		if ( null === $settings_item ) {
			return;
		}

		// phpcs:ignore WordPress.WP.GlobalVariablesOverride.Prohibited
		$submenu[ \PPADVP_TEXTDOMAIN ] = \array_merge( array( $settings_item ), $other_items );
	}

	/**
	 * Filter the admin title globally for all plugin pages to prepend plugin name and retain the default WP suffix.
	 *
	 * @param string $admin_title The page title, with extra context added by WP (e.g. site name).
	 * @param string $title       The original page title provided in add_menu_page.
	 */
	public function filter_global_admin_title( string $admin_title, string $title ): string {
		global $parent_file;
		$screen = \function_exists( 'get_current_screen' ) ? \get_current_screen() : null;

		if ( ! $this->is_ppadvp_admin_page( $screen, (string) $parent_file ) ) {
			return $admin_title;
		}

		$clean_title = $this->clean_page_title( $title );

		$new_title = \sprintf(
			/* translators: 1: Plugin name, 2: Current page title */
			\esc_html__( '%1$s &lsaquo; %2$s', 'primeplaced-advanced-password-protection' ),
			\PPADVP_NAME,
			$clean_title
		);

		return \str_replace( $title, $new_title, $admin_title );
	}

	/**
	 * Checks if the current admin screen belongs to the plugin.
	 *
	 * @param \WP_Screen|null $screen      The current WP_Screen object.
	 * @param string          $parent_file The current parent file of the menu.
	 */
	private function is_ppadvp_admin_page( ?\WP_Screen $screen, string $parent_file ): bool {
		if ( \PPADVP_TEXTDOMAIN === $parent_file ) {
			return true;
		}

		if ( $screen && 0 === \strpos( (string) $screen->post_type, 'ppadvp_' ) ) {
			return true;
		}

		if ( $screen && false !== \strpos( (string) $screen->id, \PPADVP_TEXTDOMAIN ) ) {
			return true;
		}

		return false;
	}

	/**
	 * Cleans the page title from duplicated plugin names, HTML entities, and leading separators.
	 *
	 * @param string $title The original page title.
	 */
	private function clean_page_title( string $title ): string {
		$clean = \html_entity_decode( $title, ENT_QUOTES, 'UTF-8' );

		if ( 0 === \strpos( $clean, \PPADVP_NAME ) ) {
			$clean = \substr( $clean, \strlen( \PPADVP_NAME ) );
		}

		$clean = \preg_replace( '/^[\p{Z}\p{Pd}:]+/u', '', $clean );

		if ( \is_string( $clean ) && '' !== \trim( $clean ) ) {
			return $clean;
		}

		return $title;
	}
}
