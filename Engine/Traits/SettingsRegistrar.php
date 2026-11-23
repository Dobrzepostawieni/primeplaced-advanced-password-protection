<?php
/**
 * Settings Registrar Trait.
 *
 * @package   PPADVP
 * @author    Dobrzepostawieni <contact@dobrzepostawieni.pl>
 * @copyright 2026 Dobrzepostawieni.pl
 * @license   GPL-3.0-or-later
 */

namespace PPADVP\Engine\Traits;

// Prevent direct file access.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Trait SettingsRegistrar
 */
trait SettingsRegistrar {

	/**
	 * Option prefix for individual legacy/pro options.
	 */
	protected string $setting_prefix = 'ppadvp_lock_';

	/**
	 * Post meta prefix.
	 */
	protected string $meta_prefix = '_ppadvp_';

	/**
	 * Registers the main, consolidated plugin setting (Single Source of Truth).
	 *
	 * @param string               $key  The database key (e.g. Options::get_option_name()).
	 * @param array<string, mixed> $args Registration arguments.
	 * @phpstan-param array{type?: string, label?: string, description?: string, sanitize_callback?: callable, show_in_rest?: array<string, mixed>|bool, default?: mixed} $args
	 */
	protected function register_main_setting( string $key, array $args ): void {
		$group = $this->get_option_group();

		$sanitize_callback = isset( $args['sanitize_callback'] ) && \is_callable( $args['sanitize_callback'] )
			? $args['sanitize_callback']
			: 'sanitize_text_field';

		\register_setting(
			$group,
			$key,
			array(
				'type'              => $args['type'] ?? 'string',
				'description'       => $args['description'] ?? '',
				'show_in_rest'      => $args['show_in_rest'] ?? false,
				'default'           => $args['default'] ?? '',
				'sanitize_callback' => $sanitize_callback,
			)
		);
	}

	/**
	 * Wrapper to register legacy/individual setting with automatic prefixing.
	 *
	 * @param string               $key  The short key name.
	 * @param array<string, mixed> $args Registration arguments.
	 * @phpstan-param array{type?: string, label?: string, description?: string, sanitize_callback?: callable, show_in_rest?: array<string, mixed>|bool, default?: mixed} $args
	 */
	protected function register_opt( string $key, array $args ): void {
		$full_key = $this->setting_prefix . $key;
		$group    = $this->get_option_group();

		$filtered = \apply_filters( 'ppadvp_setting_args', $args, $key );

		if ( ! \is_array( $filtered ) ) {
			$filtered = $args;
		}

		$sanitize_callback = isset( $filtered['sanitize_callback'] ) && \is_callable( $filtered['sanitize_callback'] )
			? $filtered['sanitize_callback']
			: 'sanitize_text_field';

		\register_setting(
			$group,
			$full_key,
			array(
				'type'              => $filtered['type'] ?? 'string',
				'description'       => $filtered['description'] ?? '',
				'show_in_rest'      => $filtered['show_in_rest'] ?? false,
				'default'           => $filtered['default'] ?? '',
				'sanitize_callback' => $sanitize_callback,
			)
		);
	}

	/**
	 * Wrapper to register post meta with automatic prefixing.
	 *
	 * @param string               $key        The short key name (e.g., 'is_protected').
	 * @param array<string, mixed> $args       Registration arguments.
	 * @param string               $post_type  Post type (default: 'post').
	 * @phpstan-param array{object_subtype?: string, type?: string, label?: string, description?: string, single?: bool, default?: mixed, sanitize_callback?: callable, auth_callback?: callable, show_in_rest?: array<string, mixed>|bool} $args
	 */
	protected function register_meta( string $key, array $args, string $post_type = 'post' ): void {
		$full_key = $this->meta_prefix . $key;

		$sanitize_callback = isset( $args['sanitize_callback'] ) && \is_callable( $args['sanitize_callback'] )
			? $args['sanitize_callback']
			: 'sanitize_text_field';

		\register_post_meta(
			$post_type,
			$full_key,
			array(
				'object_subtype'    => $args['object_subtype'] ?? '',
				'type'              => $args['type'] ?? 'string',
				'description'       => $args['description'] ?? '',
				'single'            => $args['single'] ?? false,
				'default'           => $args['default'] ?? '',
				'sanitize_callback' => $sanitize_callback,
				'auth_callback'     => $args['auth_callback'] ?? null,
				'show_in_rest'      => $args['show_in_rest'] ?? false,
			)
		);
	}

	/**
	 * Helper to safely retrieve the OPTION_GROUP constant from the consuming class.
	 */
	private function get_option_group(): string {
		$const_name = static::class . '::OPTION_GROUP';

		if ( \defined( $const_name ) ) {
			$value = \constant( $const_name );

			if ( \is_string( $value ) ) {
				return $value;
			}
		}

		return PPADVP_TEXTDOMAIN . '-settings';
	}
}
