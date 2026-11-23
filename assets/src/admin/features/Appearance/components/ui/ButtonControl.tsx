import { __ } from '@wordpress/i18n';
import { TextControl } from './TextControl';
import { ColorControl } from './ColorControl';
import { hasGoodContrast } from '@shared/utils/contrast';
import type { AppearanceUiComponentWithErrorsProps } from '../AppearanceForm';

export const ButtonControl = ({
	settings,
	defaults = {},
	updateSetting,
	errors,
}: AppearanceUiComponentWithErrorsProps) => {
	const defaultLabel =
		defaults.btnLabel ?? __('Log in', 'primeplaced-advanced-password-protection');
	const currentBtnBg = settings.btnBg || defaults.btnBg || '#d63638';
	const currentBtnColor = settings.btnColor || defaults.btnColor || '#FFFFFF';
	const isContrastBad = !hasGoodContrast(currentBtnBg, currentBtnColor);

	return (
		<>
			<TextControl
				label={__('Button text', 'primeplaced-advanced-password-protection')}
				value={settings.btnLabel ?? defaultLabel}
				defaultValue={defaultLabel}
				onChange={(val: string) => updateSetting('btnLabel', val)}
				help={errors.btnLabel}
				status={errors.btnLabel ? 'error' : undefined}
				hasError={!!errors.btnLabel}
				className="is-required"
			/>
			<ColorControl
				label={__('Background color', 'primeplaced-advanced-password-protection')}
				value={currentBtnBg}
				onChange={(val) => updateSetting('btnBg', val)}
				defaultValue={defaults.btnBg || '#d63638'}
			/>
			<ColorControl
				label={__('Text color', 'primeplaced-advanced-password-protection')}
				value={currentBtnColor}
				onChange={(val) => updateSetting('btnColor', val)}
				defaultValue={defaults.btnColor || '#FFFFFF'}
				hasBadContrast={isContrastBad}
				hasBadContrastText={__(
					'Poor text contrast (WCAG AA error).',
					'primeplaced-advanced-password-protection'
				)}
			/>
		</>
	);
};
