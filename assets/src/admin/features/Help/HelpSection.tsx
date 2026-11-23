// === PLIKI ===

// --- ./assets/src/admin/features/Help/HelpSection.tsx ---
/**
 * Help Section Component.
 *
 * @package
 */
import { __ } from '@wordpress/i18n';
import { useMemo, useState } from '@wordpress/element';
import { applyFilters } from '@wordpress/hooks';
import {
	Card,
	CardBody,
	CardHeader,
	Button,
	Panel,
	PanelBody,
	PanelRow,
} from '@wordpress/components';
import { page, group, envelope, comment } from '@wordpress/icons';
import { useSettingsStateContext } from '@shared/contexts';
import type { SettingsComponentProps } from '@admin/components/AnimatedTabs';
import { cn } from '@shared/utils/formatting';
import {
	StickyLayout,
	type StickySectionDef,
	type StickySectionProps,
} from '@admin/components/StickyLayout';
import { FAQ_BY_TIER, TAG_ORDER, type FaqItem, type FaqTag } from './faqData';
import './HelpSection.scss';

export const handleOpenInternalLink = (path: string): void => {
	window.open(path, '_blank', 'noopener,noreferrer');
};

const renderFaqTitle = (item: FaqItem): JSX.Element | string => {
	if (item.tier === 'free') {
		return item.question;
	}

	return (
		<span className="ppadvp-help-panels-item">
			{item.question}
			<span className={`ppadvp-help-panels-badge is-${item.tier}`}>
				{item.tier}
			</span>
		</span>
	);
};

const FaqPanelGroup = ({ items, showTierClass }: { items: FaqItem[], showTierClass?: boolean }) => {
	const [openPanels, setOpenPanels] = useState<Record<string, boolean>>({});

	const togglePanel = (id: string) => {
		setOpenPanels((prev) => ({ ...prev, [id]: !prev[id] }));
	};

	return (
		<Panel className="ppadvp-panel ppadvp-panel--help">
			{items.map((item) => (
				<PanelBody
					key={item.id}
					title={renderFaqTitle(item) as unknown as string}
					opened={!!openPanels[item.id]}
					onToggle={() => togglePanel(item.id)}
					className={cn(showTierClass && `is-${item.tier}`)}
				>
					<PanelRow>
						<p style={{ margin: 0 }}>{item.answer}</p>
					</PanelRow>
				</PanelBody>
			))}
		</Panel>
	);
};

export const HelpSection = ({ className }: SettingsComponentProps) => {
	const { proLoaded } = useSettingsStateContext();

	const tagLabels: Record<FaqTag, string> = useMemo(
		() => ({
			Overview: __('Overview', 'primeplaced-advanced-password-protection'),
			'Access Rules': __('Access rules', 'primeplaced-advanced-password-protection'),
			Passwords: __('Passwords', 'primeplaced-advanced-password-protection'),
			Cookies: __('Cookies', 'primeplaced-advanced-password-protection'),
			Templates: __('Templates', 'primeplaced-advanced-password-protection'),
			Security: __('Security', 'primeplaced-advanced-password-protection'),
			Advanced: __('Advanced', 'primeplaced-advanced-password-protection'),
			Statistics: __('Statistics', 'primeplaced-advanced-password-protection'),
			Support: __('Support', 'primeplaced-advanced-password-protection'),
			General: __('General', 'primeplaced-advanced-password-protection'),
		}),
		[]
	);

	const faqs = useMemo(() => {
		const baseFaqs = [...FAQ_BY_TIER.free];
		return applyFilters('ppadvp.ui.HelpFaqs', baseFaqs) as FaqItem[];
	}, [proLoaded]);

	const faqsByTag = useMemo(() => {
		return faqs.reduce((acc, item) => {
			const tag = item.tag || 'General';
			if (!acc[tag]) {
				acc[tag] = [];
			}
			acc[tag].push(item);
			return acc;
		}, {} as Record<string, FaqItem[]>);
	}, [faqs]);

	const sections = useMemo<StickySectionDef[]>(() => {
		const dynamicSections: StickySectionDef[] = TAG_ORDER.reduce(
			(acc, tag) => {
				const items = faqsByTag[tag];
				if (!items || items.length === 0) {
					return acc;
				}

				acc.push({
					id: `faq-${tag.toLowerCase().replace(/\s+/g, '-')}`,
					title: tagLabels[tag] || tag,
					component: ({
						title,
						isActive,
						spyRef,
						className: sectionClass,
					}: StickySectionProps) => (
						<Card
							className={cn(
								sectionClass,
								isActive && 'ppadvp-is-active'
							)}
							ref={spyRef as any}
						>
							<CardHeader className="ppadvp-settings-card-header">
								<h2>{title}</h2>
							</CardHeader>
							<CardBody className="ppadvp-settings-card-body">
								<FaqPanelGroup items={items} showTierClass={true} />
							</CardBody>
						</Card>
					),
				});
				return acc;
			},
			[] as StickySectionDef[]
		);

		const customTags = Object.keys(faqsByTag).filter(
			(tag) => !(TAG_ORDER as readonly string[]).includes(tag)
		);

		const extraSections: StickySectionDef[] = customTags.map((tag) => ({
			id: `faq-extra-${tag.toLowerCase().replace(/\s+/g, '-')}`,
			title: tag,
			component: ({
				title,
				isActive,
				spyRef,
				className: sectionClass,
			}: StickySectionProps) => (
				<Card
					className={cn(sectionClass, isActive && 'ppadvp-is-active')}
					ref={spyRef as any}
				>
					<CardHeader className="ppadvp-settings-card-header">
						<h2>{title}</h2>
					</CardHeader>
					<CardBody className="ppadvp-settings-card-body">
						<FaqPanelGroup items={faqsByTag[tag]} showTierClass={false} />
					</CardBody>
				</Card>
			),
		}));

		const linksSection: StickySectionDef = {
			id: 'help-links',
			title: __('Useful Links', 'primeplaced-advanced-password-protection'),
			component: ({
				title,
				isActive,
				spyRef,
				className: sectionClass,
			}: StickySectionProps) => (
				<Card
					className={cn(sectionClass, isActive && 'ppadvp-is-active')}
					ref={spyRef as any}
				>
					<CardHeader className="ppadvp-settings-card-header">
						<h2>{title}</h2>
					</CardHeader>
					<CardBody className="ppadvp-help-links">
						<Button
							variant="tertiary"
							icon={page}
							href="https://dobrzepostawieni.pl/advanced-password-protection/documentation"
							target="_blank"
							className="ppadvp-button"
						>
							{__(
								'Documentation',
								'primeplaced-advanced-password-protection'
							)}
						</Button>
						<Button
							variant="tertiary"
							icon={group}
							href="https://dobrzepostawieni.pl/advanced-password-protection/support"
							target="_blank"
							className="ppadvp-button"
						>
							{__(
								'Support Forum',
								'primeplaced-advanced-password-protection'
							)}
						</Button>
						<Button
							variant="tertiary"
							icon={envelope}
							className="ppadvp-button"
							target="_blank"
							href="https://dobrzepostawieni.pl/advanced-password-protection/support"
						>
							{__('Contact', 'primeplaced-advanced-password-protection')}
						</Button>
					</CardBody>
				</Card>
			),
		};

		const feedbackSection: StickySectionDef = {
			id: 'help-feedback',
			title: __('Feedback', 'primeplaced-advanced-password-protection'),
			component: ({
				title,
				isActive,
				spyRef,
				className: sectionClass,
			}: StickySectionProps) => (
				<Card
					className={cn(
						sectionClass,
						'ppadvp-feedback-card is-pro',
						isActive && 'ppadvp-is-active'
					)}
					ref={spyRef as any}
				>
					<CardHeader className="ppadvp-settings-card-header">
						<h2>{title}</h2>
					</CardHeader>
					<CardBody className="ppadvp-settings-card-body">
						<h3 className="ppadvp-feedback-card-title">
							💡{' '}
							{__(
								'Have an idea for a new feature?',
								'primeplaced-advanced-password-protection'
							)}
						</h3>
						<p className="ppadvp-feedback-card-desc">
							{__(
								'Your feedback is very important to us!',
								'primeplaced-advanced-password-protection'
							)}
						</p>
						<Button
							variant="primary"
							icon={comment}
							className="ppadvp-button is-pro"
							onClick={() =>
								handleOpenInternalLink(
									'admin.php?page=primeplaced-advanced-password-protection-contact&topic=feature_request'
								)
							}
						>
							{__(
								'Send feedback',
								'primeplaced-advanced-password-protection'
							)}
						</Button>
					</CardBody>
				</Card>
			),
		};

		return [
			...dynamicSections,
			...extraSections,
			linksSection,
			feedbackSection,
		];
	}, [faqsByTag, tagLabels]);

	return (
		<StickyLayout
			title={__('Help and Support', 'primeplaced-advanced-password-protection')}
			sections={sections}
			className={className}
		/>
	);
};