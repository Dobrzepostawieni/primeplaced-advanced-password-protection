import { __ } from '@wordpress/i18n';
import {
	Card,
	CardHeader,
	CardFooter,
	Button,
	Icon,
	// eslint-disable-next-line @wordpress/no-unsafe-wp-apis
	__experimentalHStack as HStack,
} from '@wordpress/components';
import { chevronRight } from '@wordpress/icons';
import { useMemo, useState } from '@wordpress/element';
import { useSettingsState, useSettingsStateContext } from '@shared/contexts';
import { cn } from '@shared/utils/formatting';
import { useScrollSpy } from './useScrollSpy';
import { ConfirmModal } from '../ConfirmModal';
import type { StickySectionDef, StickyLayoutProps } from './types';
import { useMediaQuery } from '@shared/hooks/useMediaQuery';

import './StickyLayout.scss';

export const StickyLayout = ({
	title,
	sections,
	headerActions,
	onSave,
	onDiscard,
	className,
}: StickyLayoutProps) => {
	const { isDirty, isSaving } = useSettingsStateContext();
	const { isPremium } = useSettingsState();
	const [isDiscardModalOpen, setIsDiscardModalOpen] = useState(false);
	const isMobile = useMediaQuery('(max-width: 782px)');

	const {
		activeSection,
		registerSection,
		headerRef,
		isTopSticky,
		isBottomSticky,
		topSentinelRef,
		bottomSentinelRef,
	} = useScrollSpy();

	const sectionTitles = useMemo(() => {
		const titles: Record<string, string> = {};
		sections.forEach((sec) => {
			titles[sec.id] = sec.title;
		});
		return titles;
	}, [sections]);

	const activeSectionActions = useMemo(() => {
		if (!activeSection) return null;
		const current = sections.find((s) => s.id === activeSection);
		return current?.headerActions || null;
	}, [activeSection, sections]);

	const executeDiscard = () => {
		if (onDiscard) {
			onDiscard();
		}
		setIsDiscardModalOpen(false);
	};

	return (
		<>
			<div
				ref={topSentinelRef}
				style={{
					height: '1px',
					width: '100%',
					pointerEvents: 'none',
					transform: 'translateY(-16px)',
					marginBottom: '-24px',
				}}
			/>

			<Card
				className={cn(
					'ppadvp-sticky-layout-top',
					className,
					isTopSticky && 'ppadvp-is-sticky'
				)}
				ref={headerRef}
			>
				<CardHeader className="ppadvp-settings-card-header ppadvp-sticky-header">
					<h2>
						{(!isMobile ||
							!activeSection ||
							!sectionTitles[activeSection]) && (
							<span className="ppadvp-breadcrumb-title">
								{title}
							</span>
						)}
						{activeSection && sectionTitles[activeSection] && (
							<>
								<Icon
									icon={chevronRight}
									size={20}
									className="ppadvp-breadcrumb-icon"
								/>
								<span className="ppadvp-active-section">
									{sectionTitles[activeSection]}
								</span>
							</>
						)}
					</h2>
					<div className="ppadvp-sticky-layout-actions">
						{isSaving && <div className="ppadvp-spinner" />}
						{activeSectionActions}
						{headerActions}
					</div>
				</CardHeader>
			</Card>

			{sections.map((Section) => (
				<Section.component
					key={Section.id}
					title={Section.title}
					isActive={activeSection === Section.id}
					spyRef={registerSection(Section.id)}
					className={cn(className, 'ppadvp-sticky-layout-section')}
					headerActions={Section.headerActions}
				/>
			))}

			{onSave && (
				<Card
					className={cn(
						className,
						'ppadvp-sticky-layout-bottom',
						isBottomSticky && 'ppadvp-is-sticky'
					)}
				>
					<CardFooter>
						<HStack justify="flex-end" spacing={3}>
							{onDiscard && isDirty && (
								<Button
									variant="tertiary"
									onClick={() => setIsDiscardModalOpen(true)}
									disabled={isSaving}
									className="ppadvp-button"
								>
									{__(
										'Cancel',
										'primeplaced-advanced-password-protection'
									)}
								</Button>
							)}
							<Button
								variant="primary"
								onClick={onSave}
								isBusy={isSaving}
								disabled={isSaving || !isDirty}
								className={cn(
									'ppadvp-button',
									isPremium && 'is-pro'
								)}
							>
								{__(
									'Save changes',
									'primeplaced-advanced-password-protection'
								)}
							</Button>
						</HStack>
					</CardFooter>
				</Card>
			)}

			<ConfirmModal
				isOpen={isDiscardModalOpen}
				title={__('Canceling changes', 'primeplaced-advanced-password-protection')}
				message={__(
					'Are you sure you want to undo all unsaved changes? The form will be restored to the last saved state.',
					'primeplaced-advanced-password-protection'
				)}
				confirmLabel={__(
					'Yes, undo changes',
					'primeplaced-advanced-password-protection'
				)}
				cancelLabel={__(
					'Return to Edit',
					'primeplaced-advanced-password-protection'
				)}
				onConfirm={executeDiscard}
				onCancel={() => setIsDiscardModalOpen(false)}
				isDestructive={true}
			/>

			{onSave && (
				<div
					ref={bottomSentinelRef}
					style={{
						height: '1px',
						width: '100%',
						pointerEvents: 'none',
						transform: 'translateY(-16px)',
						marginTop: '-24px',
					}}
				/>
			)}
		</>
	);
};
