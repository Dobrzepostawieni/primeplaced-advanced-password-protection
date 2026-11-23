// --- assets/src/admin/features/upgrade/registerUpgradeTab.tsx ---
/**
 * Pro Rules Tab Extension.
 *
 * @package
 */
import { addFilter } from '@wordpress/hooks';
import { __ } from '@wordpress/i18n';
import { Upgrade } from './Upgrade';
import type { TabDefinition } from '@admin/components/AnimatedTabs';
import { Icon } from '@wordpress/components';
import { starFilled } from '@wordpress/icons';

export const registerUpgradeTab = () => {
	const adminData = window.ppadvpAdminData || {};
	const activePlan: string = adminData.active_plan || 'free';

	if (activePlan === 'agency') {
		return;
	}

	addFilter(
		'ppadvp.ui.AppTabs',
		'ppadvp/Upgrade-tab',
		(tabs: TabDefinition[]) => {
			const advancedTab: TabDefinition = {
				name: 'upgrade',
				title: (
					<>
						<Icon icon={starFilled} />
						<span className="ppadvp-animated-tabs__button-text">
							{__(
								'Upgrade to Pro',
								'primeplaced-advanced-password-protection'
							)}
						</span>
					</>
				),
				components: [Upgrade],
				className:
					'ppadvp-animated-tabs__button--upgrade ppadvp-button is-pro',
			};

			return [...tabs, advancedTab];
		}
	);
};
