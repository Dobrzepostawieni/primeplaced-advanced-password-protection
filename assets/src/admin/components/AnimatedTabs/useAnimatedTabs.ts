/**
 * Tab Routing Hook.
 * Handles URL synchronization and dirty state protection for tabs.
 *
 * @package
 */
import { useState, useEffect, useCallback } from '@wordpress/element';
import type { TabDefinition, TabKey } from './types';

const VALID_TABS: TabKey[] = [
	'general',
	'passwords',
	'cookies',
	'appearance',
	'help',
	'advanced',
	'templates',
	'statistics',
	'upgrade',
	'debug',
];

export const useAnimatedTabs = (tabs: TabDefinition[], isDirty: boolean) => {
	const getTabFromUrl = useCallback((): TabKey => {
		if (typeof window === 'undefined') return 'general';

		const params = new URLSearchParams(window.location.search);
		const currentTab = params.get('tab') as TabKey;

		return currentTab && VALID_TABS.includes(currentTab)
			? currentTab
			: 'general';
	}, []);

	const [activeTab, setActiveTab] = useState<TabKey>(getTabFromUrl);
	const [pendingTab, setPendingTab] = useState<TabKey | null>(null);

	useEffect(() => {
		const handlePopState = () => setActiveTab(getTabFromUrl());
		window.addEventListener('popstate', handlePopState);
		return () => window.removeEventListener('popstate', handlePopState);
	}, [getTabFromUrl]);

	const performTabChange = useCallback((nextTab: TabKey) => {
		setActiveTab(nextTab);
		if (typeof window !== 'undefined') {
			const url = new URL(window.location.href);
			url.searchParams.set('tab', nextTab);
			window.history.pushState({}, '', url);
		}
		setPendingTab(null);
	}, []);

	const handleTabChange = useCallback(
		(nextTab: TabKey) => {
			if (!nextTab || nextTab === activeTab) return;
			if (isDirty) {
				setPendingTab(nextTab);
				return;
			}
			performTabChange(nextTab);
		},
		[activeTab, isDirty, performTabChange]
	);

	return {
		activeTab,
		handleTabChange,
		pendingTab,
		confirmTabChange: () => pendingTab && performTabChange(pendingTab),
		cancelTabChange: () => setPendingTab(null),
	};
};
