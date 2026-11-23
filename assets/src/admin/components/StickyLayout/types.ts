export interface StickySectionDef {
	id: string;
	title: string;
	headerActions?: React.ReactNode;
	component: React.ComponentType<any>;
}

export interface StickyLayoutProps {
	title: string;
	sections: StickySectionDef[];
	headerActions?: React.ReactNode;
	onSave?: () => void;
	onDiscard?: () => void;
	className?: string;
}

export interface StickySectionProps {
	title: string;
	isActive: boolean;
	className?: string;
	spyRef?: (element: Element | null) => void;
	headerActions?: React.ReactNode;
}
