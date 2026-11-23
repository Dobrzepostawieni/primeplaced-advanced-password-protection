import type { ReactNode, ComponentType } from 'react';

export interface SettingsComponentProps {
	className?: string;
}

export type TabKey =
	| 'general'
	| 'passwords'
	| 'cookies'
	| 'appearance'
	| 'help'
	| 'advanced'
	| 'templates'
	| 'statistics'
	| 'help'
	| 'upgrade'
	| 'debug';

export interface TabDefinition {
	name: TabKey;
	title: string | ReactNode;
	components: ComponentType<SettingsComponentProps>[];
	filterName?: string;
	order?: number;
	className?: string;
}

export interface AnimatedTabsProps {
	tabs: TabDefinition[];
	activeTab: TabKey;
	onTabChange: (tab: TabKey) => void;
}
