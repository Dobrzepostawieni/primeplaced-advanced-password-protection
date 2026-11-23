<?php
/**
 * Context helper definition.
 *
 * @package   PPADVP
 * @author    Dobrzepostawieni <contact@dobrzepostawieni.pl>
 * @copyright 2026 Dobrzepostawieni.pl
 * @license   GPL-3.0-or-later
 */

namespace PPADVP\Engine;

use PPADVP\Integrations\Capabilities;
use Inpsyde\WpContext;

// Prevent direct file access.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Context class for handling environment and request checks.
 */
class Context {

	/**
	 * WpContext instance.
	 */
	public ?\Inpsyde\WpContext $context = null;

	/**
	 * Checks the current request type.
	 *
	 * @param string $type The request type (backend, ajax, installing_wp, rest, cron, frontend, cli, amp).
	 */
	public function request( string $type ): bool {
		if ( null === $this->context ) {
			$this->context = WpContext::determine();
		}

		$checks = array(
			'backend'       => fn(): bool => $this->context->isBackoffice(),
			'ajax'          => fn(): bool => $this->context->isAjax(),
			'installing_wp' => fn(): bool => $this->context->isInstalling(),
			'rest'          => fn(): bool => $this->context->isRest(),
			'cron'          => fn(): bool => $this->context->isCron(),
			'frontend'      => fn(): bool => $this->context->isFrontoffice(),
			'cli'           => fn(): bool => $this->context->isWpCli(),
			'amp'           => fn(): bool => $this->is_amp(),
		);

		if ( ! isset( $checks[ $type ] ) ) {
			\_doing_it_wrong( __METHOD__, \esc_html( \sprintf( 'Unknown request type: %s', $type ) ), '1.0.0' );

			return false;
		}

		return $checks[ $type ]();
	}

	/**
	 * Checks if the current endpoint is AMP.
	 */
	public function is_amp(): bool {
		return \function_exists( 'is_amp_endpoint' ) && \is_amp_endpoint();
	}

	/**
	 * Checks if a user is an administrator.
	 *
	 * @param \WP_User|null $wp_user The user object to check. Defaults to the current user.
	 */
	public static function is_user_admin( ?\WP_User $wp_user = null ): bool {
		if ( null === $wp_user ) {
			$wp_user = \wp_get_current_user();
		}

		if ( ! $wp_user instanceof \WP_User ) {
			return false;
		}

		if ( \is_multisite() ) {
			return \user_can( $wp_user, Capabilities::CAP_MANAGE_SETTINGS );
		}

		return \user_can( $wp_user, Capabilities::CAP_MANAGE_SETTINGS );
	}
}
