<?php

/**
 * PPADVP
 *
 * @package    PPADVP
 * @author     Dobrzepostawieni <contact@dobrzepostawieni.pl>
 * @copyright  2026 Dobrzepostawieni.pl
 * @license    GPL-3.0-or-later
 */
namespace PPADVP\Backend;

// Prevent direct file access.
if ( !defined( 'ABSPATH' ) ) {
    exit;
}
use PPADVP\Engine\Base;
use PPADVP\Services\Options;
/**
 * Handle Activation, Deactivation and Uninstallation.
 */
class Lifecycle extends Base {
    /**
     * Initialize the class.
     *
     * @return bool True on success, false on failure.
     */
    public function initialize() : bool {
        if ( !parent::initialize() ) {
            return false;
        }
        \add_action( 'wpmu_new_blog', array($this, 'activate_new_site') );
        return true;
    }

    /**
     * Fired when a new site is activated with a WPMU environment.
     *
     * @param int $blog_id ID of the new blog.
     */
    public function activate_new_site( int $blog_id ) : void {
        if ( 1 !== \did_action( 'wpmu_new_blog' ) ) {
            return;
        }
        \switch_to_blog( $blog_id );
        self::single_activate();
        \restore_current_blog();
    }

    /**
     * Fired when the plugin is activated.
     *
     * @param bool $network_wide True if active in a multisite.
     */
    public static function activate( bool $network_wide ) : void {
        if ( \function_exists( 'is_multisite' ) && \is_multisite() && $network_wide ) {
            self::for_each_network_site( static function () : void {
                self::single_activate();
            } );
        } else {
            self::single_activate();
        }
    }

    /**
     * Fired when the plugin is deactivated.
     *
     * @param bool $network_wide True if network deactivated.
     */
    public static function deactivate( bool $network_wide ) : void {
        if ( \function_exists( 'is_multisite' ) && \is_multisite() && $network_wide ) {
            self::for_each_network_site( static function () : void {
                self::single_deactivate();
            } );
        } else {
            self::single_deactivate();
        }
    }

    /**
     * Fired when the plugin is uninstalled via Freemius.
     */
    public static function uninstall() : void {
        if ( !\current_user_can( 'activate_plugins' ) ) {
            return;
        }
        if ( \function_exists( 'is_multisite' ) && \is_multisite() ) {
            self::for_each_network_site( static function () : void {
                self::delete_plugin_data();
            } );
        } else {
            self::delete_plugin_data();
        }
    }

    /**
     * Runs a lifecycle operation for every site in a network using bounded pages.
     *
     * @param callable $operation Per-site lifecycle callback.
     */
    private static function for_each_network_site( callable $operation ) : void {
        $number = 100;
        $offset = 0;
        do {
            $site_ids = \get_sites( array(
                'fields'  => 'ids',
                'number'  => $number,
                'offset'  => $offset,
                'orderby' => 'id',
                'order'   => 'ASC',
            ) );
            foreach ( $site_ids as $site_id ) {
                \switch_to_blog( (int) $site_id );
                try {
                    $operation();
                } finally {
                    \restore_current_blog();
                }
            }
            $processed = \count( $site_ids );
            $offset += $processed;
        } while ( $number === $processed );
    }

    /**
     * Logic for single site activation.
     */
    private static function single_activate() : void {
        $salt = Options::get( 'session_salt' );
        if ( empty( $salt ) ) {
            Options::update( 'session_salt', \wp_generate_password( 64, true, true ) );
        }
        self::cleanup_legacy_option_keys();
        \flush_rewrite_rules();
    }

    /**
     * Logic for single site deactivation.
     */
    private static function single_deactivate() : void {
        /**
         * Fired during single site deactivation.
         */
        \do_action( 'ppadvp_plugin_deactivate' );
        \flush_rewrite_rules();
    }

    /**
     * Removes the obsolete empty passwords field left by older plugin versions.
     */
    private static function cleanup_legacy_option_keys() : void {
        $raw = \get_option( Options::get_option_name(), array() );
        if ( !\is_array( $raw ) || !\array_key_exists( 'passwords', $raw ) || array() !== $raw['passwords'] ) {
            return;
        }
        unset($raw['passwords']);
        \update_option( Options::get_option_name(), $raw );
    }

    /**
     * Removes all settings registered by the FREE version and fires an uninstall hook.
     */
    private static function delete_plugin_data() : void {
        global $wpdb;
        \delete_option( Options::get_option_name() );
        \delete_option( 'ppadvp_site_hash' );
        $lock_option_like = $wpdb->esc_like( 'ppadvp_lock_' ) . '%';
        $limit_option_like = $wpdb->esc_like( '_transient_ppadvp_limit_' ) . '%';
        $limit_timeout_like = $wpdb->esc_like( '_transient_timeout_ppadvp_limit_' ) . '%';
        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
        $wpdb->query( $wpdb->prepare( "DELETE FROM {$wpdb->options} WHERE option_name LIKE %s", $lock_option_like ) );
        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
        $rate_limit_options = $wpdb->get_col( $wpdb->prepare( "SELECT option_name FROM {$wpdb->options} WHERE option_name LIKE %s OR option_name LIKE %s", $limit_option_like, $limit_timeout_like ) );
        foreach ( $rate_limit_options as $option_name ) {
            \delete_option( (string) $option_name );
        }
        if ( \function_exists( 'ppadvp_fs' ) ) {
        }
        /**
         * Fired during complete uninstallation.
         */
        \do_action( 'ppadvp_plugin_uninstall_data' );
    }

}
