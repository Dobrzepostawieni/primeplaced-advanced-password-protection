/**
 * General Settings Tab Component.
 * Displays the primary protection system status controls.
 */
import { __ } from '@wordpress/i18n';
import { useMemo } from '@wordpress/element';
import { applyFilters } from '@wordpress/hooks';
import { CardBody, CardHeader, Card } from '@wordpress/components';
import type { SettingsComponentProps } from '@admin/components/AnimatedTabs';
import { SiteLockToggler } from '@shared/components/SiteLockToggler';
import {
	StickyLayout,
	type StickySectionDef,
	type StickySectionProps,
} from '@admin/components/StickyLayout';
import { cn } from '@shared/utils/formatting';

const ProtectionStatusSection = ({
	title,
	spyRef,
	isActive,
	className,
}: StickySectionProps) => (
	<Card
		className={cn(
			'ppadvp-settings-card',
			className,
			isActive && 'ppadvp-is-active'
		)}
		ref={spyRef as any}
	>
		<CardHeader className="ppadvp-settings-card-header">
			<h2>{title}</h2>
		</CardHeader>
		<CardBody className="ppadvp-settings-card-body">
			<SiteLockToggler />
		</CardBody>
	</Card>
);

export const General = ({ className }: SettingsComponentProps): JSX.Element => {
	const baseSections: StickySectionDef[] = useMemo(
		() => [
			{
				id: 'protection-status',
				title: __(
					'Protection system status',
					'primeplaced-advanced-password-protection'
				),
				component: ProtectionStatusSection,
			},
		],
		[]
	);

	const sections = useMemo(() => {
		return applyFilters(
			'ppadvp.ui.GeneralSections',
			baseSections
		) as StickySectionDef[];
	}, [baseSections]);

	return (
		<StickyLayout
			title={__('Overview', 'primeplaced-advanced-password-protection')}
			sections={sections}
			className={className}
		/>
	);
};
