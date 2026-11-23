// --- assets/src/pricing/index.tsx ---
import domReady from '@wordpress/dom-ready';
import { createRoot } from '@wordpress/element';
import { App } from './App';
import './styles.scss';

domReady(() => {
	const injectReactRoot = () => {
		const targetSection = document.querySelector(
			'.fs-section--custom-implementation'
		);

		if (targetSection && targetSection.parentNode) {
			if (document.getElementById('ppadvp-pricing-root')) {
				return;
			}

			const rootDiv = document.createElement('div');
			rootDiv.id = 'ppadvp-pricing-root';
			targetSection.parentNode.insertBefore(rootDiv, targetSection);

			createRoot(rootDiv).render(<App />);
		}
	};

	const observer = new MutationObserver((mutations, me) => {
		const targetSection = document.querySelector(
			'.fs-section--custom-implementation'
		);

		if (targetSection) {
			injectReactRoot();
			me.disconnect();
		}
	});

	observer.observe(document.body, {
		childList: true,
		subtree: true,
	});
});
