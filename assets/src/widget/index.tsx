/**
 * Widget Dashboard Entry Point.
 */

/**
 * WordPress dependencies
 */
import { createRoot } from '@wordpress/element';
import domReady from '@wordpress/dom-ready';

/**
 * Internal dependencies
 */
import { App } from './App';

domReady(() => {
	const rootNode = document.getElementById('ppadvp-widget-root');

	if (!rootNode) {
		return;
	}

	createRoot(rootNode).render(<App />);
});
