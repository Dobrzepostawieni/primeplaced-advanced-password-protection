/**
 * Cookies Section Component.
 */

import { __ } from '@wordpress/i18n';
import { useMemo, useState, useEffect } from '@wordpress/element';
import { applyFilters } from '@wordpress/hooks';
import type { ReactNode } from 'react';
import {
	CardHeader,
	CardBody,
	TextControl,
	Button,
	Card,
	Icon,
	// eslint-disable-next-line @wordpress/no-unsafe-wp-apis
	__experimentalToggleGroupControl as ToggleGroupControl,
	// eslint-disable-next-line @wordpress/no-unsafe-wp-apis
	__experimentalToggleGroupControlOption as ToggleGroupControlOption,
} from '@wordpress/components';
import { backup, calendar, update } from '@wordpress/icons';
import { cn } from '@shared/utils/formatting';
import type { StickySectionProps } from '@admin/components/StickyLayout';
import { useCookies } from '../../useCookies';
import './CookiesSection.scss';

interface CookieTab {
	value: string;
	label: string;
	icon: any;
}

export const CookiesSection = ({
	spyRef,
	className,
	isActive,
}: StickySectionProps) => {
	const {
		cookieType,
		cookieDays,
		handleTypeChange,
		handleDaysChange,
		handlePresetChange,
		handleDaysBlur,
	} = useCookies();

	const tabs = useMemo(() => {
		const baseTabs: CookieTab[] = [
			{
				value: 'duration',
				label: __('Specific time', 'primeplaced-advanced-password-protection'),
				icon: calendar,
			},
			{
				value: 'session',
				label: __('Session', 'primeplaced-advanced-password-protection'),
				icon: backup,
			},
		];
		return applyFilters('ppadvp.ui.CookiesTabs', baseTabs) as CookieTab[];
	}, []);

	const presets = useMemo(
		() => [
			{ label: __('1 day', 'primeplaced-advanced-password-protection'), value: 1 },
			{ label: __('7 days', 'primeplaced-advanced-password-protection'), value: 7 },
			{ label: __('30 days', 'primeplaced-advanced-password-protection'), value: 30 },
			{ label: __('90 days', 'primeplaced-advanced-password-protection'), value: 90 },
			{ label: __('1 year', 'primeplaced-advanced-password-protection'), value: 365 },
		],
		[]
	);

	const isValueCustom = useMemo(
		() => !presets.find((p) => p.value === Number(cookieDays)),
		[cookieDays, presets]
	);

	const [showCustomInput, setShowCustomInput] = useState(isValueCustom);

	useEffect(() => {
		if (isValueCustom) {
			setShowCustomInput(true);
		}
	}, [isValueCustom]);

	return (
		<Card
			className={cn(className, isActive && 'ppadvp-is-active')}
			ref={spyRef as any}
			style={{ marginBottom: '24px' }}
		>
			<CardHeader className="ppadvp-settings-card-header">
				<h2>
					{__('Cookies and session', 'primeplaced-advanced-password-protection')}
				</h2>
			</CardHeader>
			<CardBody className="ppadvp-settings-card-body ppadvp-cookies-wrapper">
				<div className="ppadvp-settings-card-headings">
					<p className="ppadvp-settings-card-description">
						{__(
							'Control how long the user has access after entering the password.',
							'primeplaced-advanced-password-protection'
						)}
					</p>
				</div>

				<div className="ppadvp-cookies-segmented-control">
					<ToggleGroupControl
						label={__(
							'Select access duration type',
							'primeplaced-advanced-password-protection'
						)}
						hideLabelFromVision
						value={cookieType}
						onChange={handleTypeChange}
						isBlock
						className="ppadvp-toggle-group-control ppadvp-cookies-section-toggle"
						__next40pxDefaultSize
						
					>
						{tabs.map((tab) => (
							<ToggleGroupControlOption
								key={tab.value}
								value={tab.value}
								label={tab.label}
							/>
						))}
					</ToggleGroupControl>
				</div>

				{cookieType === 'duration' && (
					<div className="ppadvp-context-box">
						<h4 className="ppadvp-context-box-title">
							<Icon icon={calendar} size={20} />
							{__(
								'How long to remember?',
								'primeplaced-advanced-password-protection'
							)}
						</h4>
						<p className="ppadvp-context-box-desc">
							{__(
								'Choose a preset or enter a custom number of days.',
								'primeplaced-advanced-password-protection'
							)}
						</p>

						<div className="ppadvp-presets-group">
							{presets.map((preset) => {
								const isPresetActive =
									!showCustomInput &&
									Number(cookieDays) === preset.value;

								return (
									<Button
										key={preset.value}
										variant={
											isPresetActive
												? 'primary'
												: 'tertiary'
										}
										onClick={() => {
											handlePresetChange(preset.value);
											setShowCustomInput(false);
										}}
										className={cn(
											'ppadvp-button',
											isPresetActive && 'is-active'
										)}
									>
										{preset.label}
									</Button>
								);
							})}
							<Button
								variant={
									showCustomInput ? 'primary' : 'secondary'
								}
								onClick={() => setShowCustomInput(true)}
								className={cn(
									'ppadvp-button',
									showCustomInput && 'is-active'
								)}
							>
								{__('Custom…', 'primeplaced-advanced-password-protection')}
							</Button>
						</div>

						{showCustomInput && (
							<div className="ppadvp-custom-days-wrapper">
								<TextControl
									label={__(
										'Number of days:',
										'primeplaced-advanced-password-protection'
									)}
									type="number"
									min={1}
									max={365}
									value={cookieDays}
									onChange={handleDaysChange}
									onBlur={handleDaysBlur}
									__next40pxDefaultSize
									
									className="ppadvp-text-control ppadvp-cookies-input"
								/>
							</div>
						)}
					</div>
				)}

				{cookieType === 'session' && (
					<div className="ppadvp-context-box ppadvp-context-box--session">
						<h4 className="ppadvp-context-box-title">
							<Icon icon={update} size={20} />
							{__(
								'Browser session',
								'primeplaced-advanced-password-protection'
							)}
						</h4>
						<p className="ppadvp-context-box-desc">
							{__(
								'Access is active only until the browser is closed. Ideal for shared devices and public places.',
								'primeplaced-advanced-password-protection'
							)}
						</p>
					</div>
				)}

				{
					applyFilters(
						'ppadvp.ui.CookiesContext',
						null,
						cookieType
					) as ReactNode
				}
			</CardBody>
		</Card>
	);
};
