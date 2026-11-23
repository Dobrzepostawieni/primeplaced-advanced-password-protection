import { __ } from '@wordpress/i18n';
import { cn } from '@shared/utils/formatting';
import { useSettingsState } from '@shared/contexts';

import './AppHeader.scss';
import logoUrl from '@images/ppadvp-logo.svg';

export const AppHeader = (): JSX.Element => {
	const { isPremium, activePlan } = useSettingsState();

	const planLabels: Record<string, string> = {
		free: __('Free', 'primeplaced-advanced-password-protection'),
		basic: __('Basic', 'primeplaced-advanced-password-protection'),
		business: __('Business', 'primeplaced-advanced-password-protection'),
		agency: __('Agency', 'primeplaced-advanced-password-protection'),
	};

	const displayPlan = planLabels[activePlan] || activePlan;

	return (
		<div className="ppadvp-settings-header">
			<span className="ppadvp-settings-header-logo">
				<img src={logoUrl} alt="Logo" width="48" height="48" />
			</span>
			<div className="ppadvp-settings-header-wrapper">
				<h2>
					{__(
						'PrimePlaced - Password Protect Site & Staging',
						'primeplaced-advanced-password-protection'
					)}
				</h2>
				<p>
					{__(
						'Protect your WordPress website professionally',
						'primeplaced-advanced-password-protection'
					)}
				</p>
			</div>
			<div
				className={cn(
					'ppadvp-settings-header-badge',
					isPremium && `is-${activePlan}`
				)}
			>
				{displayPlan}
			</div>
		</div>
	);
};
