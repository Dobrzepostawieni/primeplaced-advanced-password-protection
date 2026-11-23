<?php
/**
 * Settings Schema Class.
 *
 * Defines the JSON Schema for the plugin settings via REST API.
 * Critical for validation and sanitization during REST requests.
 *
 * @package    PPADVP
 * @author     Dobrzepostawieni <contact@dobrzepostawieni.pl>
 * @copyright  2026 Dobrzepostawieni.pl
 * @license    GPL-3.0-or-later
 */

namespace PPADVP\Rest;

// Prevent direct file access.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

use PPADVP\Rest\Abstracts\AbstractSettingsSchema;
use PPADVP\Services\Options;

/**
 * Class SettingsSchema
 */
class SettingsSchema extends AbstractSettingsSchema {

	/**
	 * Returns the option name.
	 */
	protected static function get_option_name(): string {
		return Options::get_option_name();
	}

	/**
	 * Aggregates all properties for the schema.
	 *
	 * @return array<string, array<string, mixed>>
	 */
	protected static function get_properties(): array {
		$properties = \array_merge(
			self::get_scalar_properties(),
			array(
				'design_settings' => self::get_design_schema(),
				'password'        => self::get_password_schema(),
			)
		);

		return (array) \apply_filters( 'ppadvp_rest_settings_schema_properties', $properties );
	}

	/**
	 * Returns schema for scalar (simple) values.
	 *
	 * @return array<string, array{type: string, default?: mixed, enum?: array<string>, minimum?: int, maximum?: int}>
	 */
	private static function get_scalar_properties(): array {
		return array(
			'protection'   => array(
				'type'    => 'boolean',
				'default' => false,
			),
			'cookie_type'  => array(
				'type'    => 'string',
				'enum'    => array( 'duration', 'session' ),
				'default' => 'duration',
			),
			'cookie_days'  => array(
				'type'    => 'integer',
				'minimum' => 1,
				'maximum' => 365,
				'default' => 7,
			),
			'session_salt' => array(
				'type'    => 'string',
				'default' => '',
			),
		);
	}

	/**
	 * Returns schema for the single password object.
	 *
	 * @return array<string, mixed>
	 */
	private static function get_password_schema(): array {
		return array(
			'type'       => array( 'object', 'null' ),
			'properties' => array(
				'id'          => array( 'type' => 'string' ),
				'name'        => array( 'type' => 'string' ),
				'password'    => array(
					'type'      => 'string',
					'minLength' => 6,
				),
				'is_active'   => array( 'type' => 'boolean' ),
				'author_id'   => array( 'type' => array( 'integer', 'string' ) ),
				'author_name' => array( 'type' => 'string' ),
				'author_role' => array( 'type' => 'string' ),
			),
			'default'    => null,
		);
	}

	/**
	 * Returns schema for the design object.
	 *
	 * @return array{type: string, properties: array<string, array{type: string}>, default: array<string, mixed>}
	 */
	private static function get_design_schema(): array {
		$options  = Options::get_defaults();
		$defaults = array();

		if ( isset( $options['design_settings'] ) && \is_array( $options['design_settings'] ) ) {
			$defaults = $options['design_settings'];
		}

		$properties = array();
		foreach ( $defaults as $key => $value ) {
			$properties[ $key ] = array(
				'type' => self::get_json_schema_type( $value ),
			);
		}

		return array(
			'type'       => 'object',
			'properties' => $properties,
			'default'    => $defaults,
		);
	}

	/**
	 * Maps a PHP variable type to a valid JSON Schema type.
	 *
	 * @param mixed $value The value to check.
	 * @return string The mapped JSON Schema type.
	 */
	private static function get_json_schema_type( $value ): string {
		if ( \is_int( $value ) ) {
			return 'integer';
		}
		if ( \is_bool( $value ) ) {
			return 'boolean';
		}
		if ( \is_float( $value ) ) {
			return 'number';
		}
		if ( \is_array( $value ) ) {
			return 'object';
		}
		return 'string';
	}
}
