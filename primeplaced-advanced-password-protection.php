<?php

/**
 * The main plugin file.
 *
 * @package           PPADVP
 * @author            Dobrzepostawieni
 * @copyright         2026 Dobrzepostawieni.pl
 * @license           GPL-3.0-or-later
 *
 * @wordpress-plugin
 * Plugin Name:       PrimePlaced - Password Protect Site & Staging
 * Plugin URI:        https://dobrzepostawieni.pl/advanced-password-protection
 * Description:       Simple password protection for your site. Built for campaigns, client drafts, and private content. Gutenberg ready.
 * Requires at least: 6.2
 * Requires PHP:      7.4
 * Version:           1.0.3
 * Author:            Dobrzepostawieni
 * Author URI:        https://dobrzepostawieni.pl
 * License:           GPL-3.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-3.0.html
 * Text Domain:       primeplaced-advanced-password-protection
 * Domain Path:       /languages
 *
 */
// Prevent direct file access.
if ( !defined( 'ABSPATH' ) ) {
    exit;
}
define( 'PPADVP_VERSION', '1.0.3' );
define( 'PPADVP_TEXTDOMAIN', 'primeplaced-advanced-password-protection' );
define( 'PPADVP_NAME', 'PrimePlaced - Password Protect Site & Staging' );
define( 'PPADVP_PLUGIN_ROOT', plugin_dir_path( __FILE__ ) );
define( 'PPADVP_PLUGIN_ABSOLUTE', __FILE__ );
define( 'PPADVP_MIN_PHP_VERSION', '7.4' );
define( 'PPADVP_WP_VERSION', '6.2' );
define( 'PPADVP_API_NAMESPACE', 'ppadvp/v1' );
// phpcs:ignore WordPress.WP.GlobalVariablesOverride.Prohibited
$ppadvp_libraries = (require PPADVP_PLUGIN_ROOT . 'vendor/autoload.php');
if ( function_exists( 'ppadvp_fs' ) ) {
    ppadvp_fs()->set_basename( false, __FILE__ );
} else {
    /**
     * Create a helper function for easy SDK access.
     */
    function ppadvp_fs() : \Freemius {
        global $ppadvp_fs;
        if ( !isset( $ppadvp_fs ) ) {
            $ppadvp_fs = fs_dynamic_init( array(
                'id'               => '23191',
                'slug'             => 'primeplaced-advanced-password-protection',
                'premium_slug'     => 'primeplaced-advanced-password-protection-pro',
                'type'             => 'plugin',
                'public_key'       => 'pk_1024cb832855e4b3527903df82e83',
                'is_premium'       => false,
                'has_addons'       => false,
                'has_paid_plans'   => true,
                'is_org_compliant' => true,
                'menu'             => array(
                    'slug'    => 'primeplaced-advanced-password-protection',
                    'contact' => false,
                    'support' => false,
                    'pricing' => true,
                ),
                'is_live'          => true,
            ) );
        }
        return $ppadvp_fs;
    }

    ppadvp_fs();
    do_action( 'ppadvp_fs_loaded' );
}
if ( !wp_installing() ) {
    register_activation_hook( __FILE__, array(\PPADVP\Backend\Lifecycle::class, 'activate') );
    register_deactivation_hook( __FILE__, array(\PPADVP\Backend\Lifecycle::class, 'deactivate') );
    add_action( 
        'plugins_loaded',
        /**
         * Initialize Engine.
         *
         * @return void
         */
        static function () use($ppadvp_libraries) : void {
            new \PPADVP\Engine\Initializer($ppadvp_libraries);
        }
     );
}
if ( function_exists( 'ppadvp_fs' ) ) {
    ppadvp_fs()->add_action( 'after_uninstall', array(\PPADVP\Backend\Lifecycle::class, 'uninstall') );
}
add_action( 'admin_init', function () : void {
    if ( !function_exists( 'wp_add_privacy_policy_content' ) ) {
        return;
    }
    $content = sprintf( '<p class="privacy-policy-tutorial">%s</p>', __( 'When visitors try to access password-protected content on your site, we process the following data to ensure security:', 'primeplaced-advanced-password-protection' ) );
    $content .= sprintf( '<h3>%s</h3><p>%s</p>', __( 'Cookies:', 'primeplaced-advanced-password-protection' ), __( 'We set a temporary or persistent cookie to remember the authentication state. This is strictly necessary for the feature to work and does not track users across other websites.', 'primeplaced-advanced-password-protection' ) );
    $content .= sprintf( '<h3>%s</h3><p>%s</p>', __( 'Freemius account and licensing services:', 'primeplaced-advanced-password-protection' ), __( 'This plugin includes the Freemius SDK for optional account connection, licensing, upgrade checkout, and software update services. Freemius communication happens through administrator-initiated account, opt-in, checkout, support, or update flows and is subject to the Freemius privacy policy at https://freemius.com/privacy/.', 'primeplaced-advanced-password-protection' ) );
    /**
     * Filters the privacy-policy content before it is registered with WordPress.
     *
     * Premium modules append their disclosures from code that is removed from
     * the Free package, keeping the Free translation catalog accurate.
     *
     * @param string $content Privacy-policy HTML.
     */
    $content = apply_filters( 'ppadvp_privacy_policy_content', $content );
    wp_add_privacy_policy_content( __( 'PrimePlaced - Password Protect Site & Staging', 'primeplaced-advanced-password-protection' ), wp_kses_post( $content ) );
} );