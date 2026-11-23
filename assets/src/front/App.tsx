/**
 * Main Frontend Application Wrapper.
 *
 * @package
 */

import { FrontProvider } from '@shared/contexts/FrontContext';
import { AppContent } from './AppContent';
import './styles.scss';

export const App = (): JSX.Element | null => {
	if (!window.ppadvpFrontData) {
		return null;
	}

	return (
		<FrontProvider>
			<AppContent />
		</FrontProvider>
	);
};
