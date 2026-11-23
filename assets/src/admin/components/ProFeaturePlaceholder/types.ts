import type { ReactNode } from 'react';

export interface ProFeaturePlaceholderProps {
	imageSrc: string;
	imageAlt?: string;
	title: ReactNode;
	description: ReactNode;
	features?: ReactNode[];
	buttonText?: string;
	buttonUrl?: string;
	className?: string;
}
