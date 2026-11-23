import { __ } from '@wordpress/i18n';
import {
	Button,
	ColorIndicator,
	ColorPalette,
	Dropdown,
	Icon,
	Tooltip,
} from '@wordpress/components';
import { caution, reset } from '@wordpress/icons';
import type { MouseEvent } from 'react';
import type { ColorControlProps } from '../AppearanceForm';
import type { PpadvpAdminData } from '@shared/types/entities';
import type { DropdownRenderProps } from '@shared/types/wordpress-components';

export const ColorControl = ({
	label,
	value,
	onChange,
	defaultValue,
	hasBadContrast,
	hasBadContrastText,
}: ColorControlProps) => {
	const ppadvpData = window.ppadvpAdminData as PpadvpAdminData;
	const themeColors = ppadvpData.theme_colors || [];

	const targetDefault = defaultValue !== undefined ? defaultValue : value;

	const handleRestore = (e: MouseEvent) => {
		e.stopPropagation();
		if (defaultValue !== undefined) {
			onChange(defaultValue);
		}
	};

	return (
		<div className="ppadvp-appearance-input-wrapper">
			<div
				className="ppadvp-label"
				id={`label-${label.replace(/\s+/g, '-')}`}
			>
				{label}
				{hasBadContrast && (
					<Tooltip text={hasBadContrastText}>
						<Icon
							icon={caution}
							style={{
								cursor: 'pointer',
								marginLeft: '2px',
								marginBlock: '-6px',
							}}
						/>
					</Tooltip>
				)}
			</div>

			{value !== targetDefault && (
				<Tooltip
					text={__(
						'Restore default value',
						'primeplaced-advanced-password-protection'
					)}
				>
					<Button
						size="compact"
						icon={reset}
						variant="tertiary"
						onClick={handleRestore}
						label={__(
							'Restore default value',
							'primeplaced-advanced-password-protection'
						)}
						showTooltip={true}
						className="ppadvp-appearance-color-control-icon"
					/>
				</Tooltip>
			)}

			<Dropdown
				popoverProps={{ placement: 'left-start' }}
				renderToggle={({
					isOpen,
					onToggle,
				}: DropdownRenderProps) => (
					<Button
						variant="tertiary"
						onClick={onToggle}
						aria-expanded={isOpen}
						aria-labelledby={`label-${label.replace(/\s+/g, '-')}`}
						className="ppadvp-button ppadvp-appearance-color-control"
					>
						<ColorIndicator colorValue={value} />
						{value}
					</Button>
				)}
				renderContent={() => (
					<div style={{ padding: '8px' }}>
						<ColorPalette
							colors={themeColors}
							style={{ minWidth: '200px' }}
							value={value}
							onChange={(val: string | undefined) =>
								onChange(val || '')
							}
							clearable={false}
						/>
						{value !== targetDefault && (
							<Tooltip
								text={__(
									'Restore default value',
									'primeplaced-advanced-password-protection'
								)}
							>
								<Button
									size="compact"
									variant="tertiary"
									onClick={handleRestore}
									aria-label={__(
										'Reset',
										'primeplaced-advanced-password-protection'
									)}
									style={{ float: 'right' }}
								>
									{__(
										'Reset',
										'primeplaced-advanced-password-protection'
									)}
								</Button>
							</Tooltip>
						)}
					</div>
				)}
			/>
		</div>
	);
};
