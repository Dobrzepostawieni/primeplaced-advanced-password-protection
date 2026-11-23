import { __ } from '@wordpress/i18n';
import { ColorControl } from './ColorControl';
import { TextControl } from './TextControl';
import { hasGoodContrast } from '@shared/utils/contrast';
import type { AppearanceUiComponentWithErrorsProps } from '../AppearanceForm';

export const ErrorControl = ({
	settings,
	defaults = {},
	updateSetting,
	errors,
}: AppearanceUiComponentWithErrorsProps) => {
	const defaultErrorMsg =
		defaults.errorMsg ??
		__( 'Incorrect password.', 'primeplaced-advanced-password-protection');
	const currentErrorBg = settings.errorBg || defaults.errorBg || '#D63638';
	const currentErrorColor =
		settings.errorColor || defaults.errorColor || '#FFFFFF';

	const isContrastBad = !hasGoodContrast(currentErrorBg, currentErrorColor);

	return (
		<>
			<TextControl
				label={__( 'Message content', 'primeplaced-advanced-password-protection')}
				value={settings.errorMsg ?? defaultErrorMsg}
				defaultValue={defaultErrorMsg}
				onChange={(val: string) => updateSetting('errorMsg', val)}
				help={errors.errorMsg}
				status={errors.errorMsg ? 'error' : undefined}
				hasError={!!errors.errorMsg}
				className="is-required"
			/>
			<ColorControl
				label={__( 'Background color', 'primeplaced-advanced-password-protection')}
				value={currentErrorBg}
				onChange={(val) => updateSetting('errorBg', val)}
				defaultValue={defaults.errorBg || '#D63638'}
			/>
			<ColorControl
				label={__( 'Text color', 'primeplaced-advanced-password-protection')}
				value={currentErrorColor}
				onChange={(val) => updateSetting('errorColor', val)}
				defaultValue={defaults.errorColor || '#FFFFFF'}
				hasBadContrast={isContrastBad}
				hasBadContrastText={__( 'Poor text contrast (WCAG AA error).',
					'primeplaced-advanced-password-protection'
				)}
			/>
		</>
	);
};
