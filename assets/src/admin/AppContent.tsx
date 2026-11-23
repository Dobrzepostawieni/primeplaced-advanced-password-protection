/**
 * Main Application Content.
 *
 * @package
 */
import { __ } from '@wordpress/i18n';
import { useMemo, useEffect } from '@wordpress/element';
import { applyFilters } from '@wordpress/hooks';
import {
	useSettingsStateContext,
	useSettingsDispatch,
	useSettingsState,
} from '@shared/contexts';
import { Notices, useNotices } from '@shared/components/Notices';
import { ConfirmModal } from '@admin/components/ConfirmModal';
import {
	AnimatedTabs,
	useAnimatedTabs,
	type TabDefinition,
	type SettingsComponentProps,
} from '@admin/components/AnimatedTabs';
import { AppHeader } from '@shared/components/AppHeader';
import { DashboardStats } from '@shared/components/DashboardStats';
import { General } from '@features/General';
import { Passwords } from '@features/Passwords';
import { Cookies } from '@features/Cookies';
import { Appearance } from '@features/Appearance';
import { HelpSection } from './features/Help';
import { Icon } from '@wordpress/components';
import { backup, dashboard, helpFilled, key, pencil } from '@wordpress/icons';

export const AppContent = (): JSX.Element => {
	const { ppadvpData, isDirty, proLoaded } = useSettingsStateContext();
	const { discard } = useSettingsDispatch();
	const { isPremium } = useSettingsState();
	const { notify } = useNotices();

	useEffect(() => {
		if (ppadvpData.has_fs_error) {
			notify('FREEMIUS_API_ERROR');
		}
	}, [ppadvpData.has_fs_error, notify]);

	const tabs: TabDefinition[] = useMemo(() => {
		const baseTabs: TabDefinition[] = [
			{
				name: 'general',
				title: (
					<>
						<Icon icon={dashboard} />
						<span className="ppadvp-animated-tabs__button-text">
							{__('Overview', 'primeplaced-advanced-password-protection')}
						</span>
					</>
				),
				components: [General],
				filterName: 'ppadvp.ui.AppContentGeneral',
				order: 1,
			},
			{
				name: 'passwords',
				title: (
					<>
						<Icon icon={key} />
						<span className="ppadvp-animated-tabs__button-text">
							{__('Passwords', 'primeplaced-advanced-password-protection')}
						</span>
					</>
				),
				components: [Passwords],
				filterName: 'ppadvp.ui.AppContentPasswords',
				order: 2,
			},
			{
				name: 'cookies',
				title: (
					<>
						<Icon icon={backup} />
						<span className="ppadvp-animated-tabs__button-text">
							{__('Cookies', 'primeplaced-advanced-password-protection')}
						</span>
					</>
				),
				components: [Cookies],
				filterName: 'ppadvp.ui.AppContentCookies',
				order: 3,
			},
			{
				name: 'appearance',
				title: (
					<>
						<Icon icon={pencil} />
						<span className="ppadvp-animated-tabs__button-text">
							{__('Templates', 'primeplaced-advanced-password-protection')}
						</span>
					</>
				),
				components: [Appearance],
				filterName: 'ppadvp.ui.AppContentAppearance',
				order: 4,
			},
			{
				name: 'help',
				title: (
					<>
						<Icon icon={helpFilled} />
						<span className="ppadvp-animated-tabs__button-text">
							{__('Help', 'primeplaced-advanced-password-protection')}
						</span>
					</>
				),
				components: [HelpSection],
				filterName: 'ppadvp.ui.AppContentHelp',
				order: 7,
			},
		];

		const processedTabs = baseTabs.map((tab) => {
			if (tab.filterName) {
				return {
					...tab,
					components: applyFilters(
						tab.filterName,
						tab.components
					) as React.ComponentType<SettingsComponentProps>[],
				};
			}
			return tab;
		});

		const filteredTabs = applyFilters(
			'ppadvp.ui.AppTabs',
			processedTabs
		) as TabDefinition[];

		return filteredTabs.sort((a, b) => (a.order || 10) - (b.order || 10));
	}, [proLoaded]);

	const {
		activeTab,
		handleTabChange,
		pendingTab,
		confirmTabChange,
		cancelTabChange,
	} = useAnimatedTabs(tabs, isDirty);

	useEffect(() => {
		if (proLoaded && !tabs.find((t) => t.name === activeTab)) {
			handleTabChange(tabs[0].name);
		}
	}, [proLoaded, tabs, activeTab, handleTabChange]);

	const activeTabDef = tabs.find((t) => t.name === activeTab) || tabs[0];

	const handleDiscardAndLeave = () => {
		discard();
		confirmTabChange();
	};

	return (
		<div className="ppadvp-admin-app" data-theme={isPremium ? 'pro' : 'free'}>
			<Notices />
			<AppHeader />
			<DashboardStats />
			<div className="ppadvp-main-layout">
				{!proLoaded ? (
					<div
						style={{
							display: 'flex',
							justifyContent: 'center',
							padding: '60px 0',
						}}
					>
						<div className="ppadvp-spinner" />
					</div>
				) : (
					<>
						<AnimatedTabs
							tabs={tabs}
							activeTab={activeTabDef.name}
							onTabChange={handleTabChange}
						/>
						<div className="ppadvp-main-content">
							{activeTabDef.components.map((Component, index) => (
								<Component
									key={`tab-${activeTabDef.name}-component-${index}`}
									className="ppadvp-settings-card"
								/>
							))}
						</div>
					</>
				)}
			</div>
			{pendingTab && (
				<ConfirmModal
					isOpen={!!pendingTab}
					title={__(
						'Unsaved changes',
						'primeplaced-advanced-password-protection'
					)}
					message={__(
						'You have unsaved changes in the current tab. Are you sure you want to leave? All changes will be lost.',
						'primeplaced-advanced-password-protection'
					)}
					confirmLabel={__(
						'Discard changes and leave',
						'primeplaced-advanced-password-protection'
					)}
					cancelLabel={__(
						'Go back and save',
						'primeplaced-advanced-password-protection'
					)}
					onConfirm={handleDiscardAndLeave}
					onCancel={cancelTabChange}
					isDestructive={true}
				/>
			)}
		</div>
	);
};
