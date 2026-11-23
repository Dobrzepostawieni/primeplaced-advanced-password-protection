/**
 * Cookies Settings Tab.
 *
 * @package
 */

import { __ } from '@wordpress/i18n';
import {
	StickyLayout,
	type StickySectionDef,
} from '@admin/components/StickyLayout';
import type { SettingsComponentProps } from '@admin/components/AnimatedTabs';
import { CookiesSection } from './components/CookiesSection';
import { SecuritySection } from './components/SecuritySection';
import './Cookies.scss';

export const Cookies = ({ className }: SettingsComponentProps) => {
	const sections: StickySectionDef[] = [
		{
			id: 'cookies-session',
			title: __('Cookies and session', 'primeplaced-advanced-password-protection'),
			component: CookiesSection,
		},
		{
			id: 'cookies-security',
			title: __('Security', 'primeplaced-advanced-password-protection'),
			component: SecuritySection,
		},
	];

	return (
		<StickyLayout
			title={__('Cookies', 'primeplaced-advanced-password-protection')}
			sections={sections}
			className={className}
		/>
	);
};
