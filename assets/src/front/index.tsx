/**
 * External dependencies
 */
import { createRoot } from '@wordpress/element';
import domReady from '@wordpress/dom-ready';

/**
 * Internal dependencies
 */
import { App } from './App';

domReady(() => {
	const rootElement = document.getElementById('ppadvp-lock-screen-root');

	if (!rootElement) {
		return;
	}

	createRoot(rootElement).render(<App />);
});
