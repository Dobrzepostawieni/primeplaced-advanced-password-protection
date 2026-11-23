<?php
/**
 * Abstract Settings Schema.
 *
 * Provides a standardized JSON Schema wrapper for plugin settings endpoints.
 *
 * @package   PPADVP
 * @author    Dobrzepostawieni <contact@dobrzepostawieni.pl>
 * @copyright 2026 Dobrzepostawieni.pl
 * @license   GPL-3.0-or-later
 */

namespace PPADVP\Rest\Abstracts;

// Prevent direct file access.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Class AbstractSettingsSchema
 */
abstract class AbstractSettingsSchema {

	/**
	 * Returns the base option name to be used as the schema title.
	 *
	 * @return string Option name.
	 */
	abstract protected static function get_option_name(): string;

	/**
	 * Returns the aggregated properties for the schema.
	 *
	 * @return array<string, array<string, mixed>> Schema properties.
	 */
	abstract protected static function get_properties(): array;

	/**
	 * Returns the unified JSON Schema.
	 *
	 * @return array{'$schema': string, title: string, type: string, properties: array<string, mixed>, additionalProperties: bool} The schema array.
	 */
	public static function get(): array {
		return array(
			'$schema'              => 'http://json-schema.org/draft-04/schema#',
			'title'                => static::get_option_name(),
			'type'                 => 'object',
			'properties'           => static::get_properties(),
			'additionalProperties' => false,
		);
	}
}
