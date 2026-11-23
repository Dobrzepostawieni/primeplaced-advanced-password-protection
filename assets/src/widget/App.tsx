import { __ } from '@wordpress/i18n';
import { Button } from '@wordpress/components';
import { useEffect } from '@wordpress/element';

import { DashboardStats } from '@shared/components/DashboardStats';
import { Notices, useNotices } from '@shared/components/Notices';
import {
	SettingsProvider,
	useSettingsStateContext,
	useSettingsState,
} from '@shared/contexts';
import type { PpadvpWidgetData } from '@shared/types/entities';
import './styles.scss';

import { SiteLockToggler } from '@shared/components/SiteLockToggler';
import { cn } from '@shared/utils/formatting';

const WidgetContent = () => {
	const { ppadvpData } = useSettingsStateContext();
	const { isPremium, activePlan } = useSettingsState();
	const { notify } = useNotices();

	useEffect(() => {
		if (ppadvpData.has_fs_error) {
			notify('FREEMIUS_API_ERROR');
		}
	}, [ppadvpData.has_fs_error, notify]);

	const widgetData = ppadvpData as unknown as PpadvpWidgetData;
	const settingsUrl = widgetData?.settings_url || 'admin.php?page=ppadvp';

	const planLabels: Record<string, string> = {
		free: __('Free', 'primeplaced-advanced-password-protection'),
		basic: __('Basic', 'primeplaced-advanced-password-protection'),
		business: __('Business', 'primeplaced-advanced-password-protection'),
		agency: __('Agency', 'primeplaced-advanced-password-protection'),
	};

	const displayPlan = planLabels[activePlan] || activePlan;

	return (
		<div
			className="ppadvp-widget-inner"
			data-theme={isPremium ? 'pro' : 'free'}
		>
			<Notices context="widget" />
			<DashboardStats />

			<div className="ppadvp-widget-box">
				<SiteLockToggler />
			</div>

			<div className="ppadvp-widget-box ppadvp-widget-box--footer">
				<div
					className={cn(
						'ppadvp-widget-box-badge',
						isPremium && `is-${activePlan}`
					)}
				>
					{displayPlan}
				</div>
				<Button
					variant="primary"
					className="ppadvp-button ppadvp-widget-box-button"
					href={settingsUrl}
				>
					{__('Settings', 'primeplaced-advanced-password-protection')}
				</Button>
			</div>
		</div>
	);
};

export const App = (): JSX.Element => {
	return (
		<SettingsProvider>
			<WidgetContent />
		</SettingsProvider>
	);
};
