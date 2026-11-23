/**
 * Main Application Wrapper.
 */

/**
 * Internal dependencies
 */
import { SettingsProvider } from '@shared/contexts';
import { AppContent } from './AppContent';
import './App.scss';

/**
 * Root component for the Admin interface.
 *
 * @return The rendered component.
 */
export const App = (): JSX.Element => {
	return (
		<SettingsProvider>
			<AppContent />
		</SettingsProvider>
	);
};
