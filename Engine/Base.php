<?php
/**
 * Base component definition.
 *
 * @package   PPADVP
 * @author    Dobrzepostawieni <contact@dobrzepostawieni.pl>
 * @copyright 2026 Dobrzepostawieni.pl
 * @license   GPL-3.0-or-later
 */

namespace PPADVP\Engine;

// Prevent direct file access.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Base class for all components.
 */
abstract class Base {

	/**
	 * Initializes the component logic.
	 */
	public function initialize(): bool {
		return true;
	}
}
