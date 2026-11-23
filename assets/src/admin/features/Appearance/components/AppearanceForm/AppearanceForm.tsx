import { __ } from '@wordpress/i18n';
import { applyFilters } from '@wordpress/hooks';
import {
	Card,
	CardHeader,
	CardBody,
	Panel,
	PanelBody,
	PanelRow,
} from '@wordpress/components';
import { useState } from '@wordpress/element';
import {
	image,
	page,
	color,
	button,
	error as errorIcon,
} from '@wordpress/icons';
import { cn } from '@shared/utils/formatting';
import { LockScreen, LockScreenProvider } from '@shared/LockScreen';
import { useAppearance } from '../../useAppearance';

import type { StickySectionProps } from '@components/StickyLayout';

import { ColorControl } from '../ui/ColorControl';
import { LogoControl } from '../ui/LogoControl';
import { ButtonControl } from '../ui/ButtonControl';
import { TextControl } from '../ui/TextControl';
import { ErrorControl } from '../ui/ErrorControl';
import './AppearanceForm.scss';
import type { ReactNode } from 'react';

export const AppearanceForm = ({
	title,
	spyRef,
	isActive,
	className,
}: StickySectionProps) => {
	const {
		isLoading,
		settings,
		defaults,
		updateSetting,
		errors,
		logoUrl,
		cookieType,
		enableRememberMe,
	} = useAppearance();

	const [activePanel, setActivePanel] = useState<string | null>();

	const togglePanel = (panelName: string) => {
		setActivePanel((prev) => (prev === panelName ? null : panelName));
	};

	return (
		<Card
			className={cn(
				'ppadvp-settings-card ppadvp-sticky-layout-section',
				className,
				isActive && 'ppadvp-is-active'
			)}
			ref={spyRef}
		>
			<CardHeader className="ppadvp-settings-card-header">
				<h2>{title}</h2>
			</CardHeader>
			<CardBody className="ppadvp-appearance-content">
				<div className="ppadvp-preview-frame">
					<div className="ppadvp-preview-frame-header">
						{__('Preview', 'primeplaced-advanced-password-protection')}
						{
							applyFilters(
								'ppadvp.ui.AppearancePreviewOverlay',
								null
							) as ReactNode
						}
					</div>
					<LockScreenProvider
						value={{
							settings,
							cookieType: cookieType || 'duration',
							enableRememberMe,
							logoUrl,
							isPreview: true,
							runtimeError: '',
						}}
					>
						<LockScreen />
					</LockScreenProvider>

					<p className="ppadvp-appearance-panel-info">
						{__(
							'The form is running in preview mode.',
							'primeplaced-advanced-password-protection'
						)}
					</p>
				</div>
				<div className="ppadvp-settings-sidebar">
					<Panel
						header={__('Settings', 'primeplaced-advanced-password-protection')}
						className="ppadvp-panel ppadvp-appearance-panel"
					>
						<PanelBody
							icon={color}
							title={__(
								'Background and header',
								'primeplaced-advanced-password-protection'
							)}
							opened={activePanel === 'general'}
							onToggle={() => togglePanel('general')}
						>
							<PanelRow>
								<TextControl
									label={__(
										'Page title',
										'primeplaced-advanced-password-protection'
									)}
									value={settings.title ?? ''}
									defaultValue={defaults.title}
									onChange={(val) =>
										updateSetting('title', val)
									}
								/>
								<ColorControl
									label={__(
										'Background color',
										'primeplaced-advanced-password-protection'
									)}
									value={settings.bgColor || '#FEF2F2'}
									defaultValue={defaults.bgColor}
									onChange={(val) =>
										updateSetting('bgColor', val)
									}
								/>
							</PanelRow>
						</PanelBody>

						<PanelBody
							icon={image}
							title={__('Logo', 'primeplaced-advanced-password-protection')}
							opened={activePanel === 'logo'}
							onToggle={() => togglePanel('logo')}
						>
							<PanelRow>
								<LogoControl
									settings={settings}
									defaults={defaults}
									updateSetting={updateSetting}
									isLoading={isLoading}
								/>
							</PanelRow>
						</PanelBody>

						<PanelBody
							icon={page}
							title={__(
								'Password field',
								'primeplaced-advanced-password-protection'
							)}
							opened={activePanel === 'form'}
							onToggle={() => togglePanel('form')}
						>
							<PanelRow>
								<TextControl
									label={__(
										'Field label',
										'primeplaced-advanced-password-protection'
									)}
									value={settings.label ?? ''}
									defaultValue={defaults.label}
									onChange={(val) =>
										updateSetting('label', val)
									}
								/>
								<TextControl
									label={__(
										'Placeholder text',
										'primeplaced-advanced-password-protection'
									)}
									value={settings.inputPlaceholder ?? ''}
									defaultValue={defaults.inputPlaceholder}
									onChange={(val) =>
										updateSetting('inputPlaceholder', val)
									}
								/>
							</PanelRow>
						</PanelBody>

						<PanelBody
							icon={errorIcon}
							title={__(
								'Error message',
								'primeplaced-advanced-password-protection'
							)}
							opened={activePanel === 'error'}
							onToggle={() => togglePanel('error')}
							className={cn({
								'has-error': !isLoading && errors.errorMsg,
							})}
						>
							<PanelRow>
								<ErrorControl
									isLoading={isLoading}
									settings={settings}
									defaults={defaults}
									updateSetting={updateSetting}
									errors={errors}
								/>
							</PanelRow>
						</PanelBody>

						<PanelBody
							icon={button}
							title={__(
								'Submit button',
								'primeplaced-advanced-password-protection'
							)}
							opened={activePanel === 'button'}
							onToggle={() => togglePanel('button')}
							className={cn({
								'has-error': !isLoading && errors.btnLabel,
							})}
						>
							<PanelRow>
								<ButtonControl
									isLoading={isLoading}
									settings={settings}
									defaults={defaults}
									updateSetting={updateSetting}
									errors={errors}
								/>
							</PanelRow>
						</PanelBody>

						<p className="ppadvp-appearance-panel-info">
							{__(
								'* Required fields.',
								'primeplaced-advanced-password-protection'
							)}
						</p>
					</Panel>
				</div>
			</CardBody>
		</Card>
	);
};
