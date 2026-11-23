import { cn } from '@shared/utils/formatting';
import {
	TextControl as WpTextControl,
	Button,
	Tooltip,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { reset } from '@wordpress/icons';
import type { PpadvpTextControlProps } from '../AppearanceForm';

export const TextControl = ({
	label,
	value,
	defaultValue,
	onChange,
	help,
	hasError,
	className,
}: PpadvpTextControlProps) => {
	const safeValue = value ?? '';
	const isModified = safeValue !== defaultValue;

	return (
		<div className="ppadvp-appearance-text-control-wrapper">
			<WpTextControl
				label={label}
				value={safeValue}
				onChange={onChange}
				help={help}
				className={cn(
					'ppadvp-text-control',
					hasError && 'has-error',
					className
				)}
				__next40pxDefaultSize
				
			/>
			{isModified && defaultValue !== undefined && (
				<Tooltip
					text={__( 'Restore default value',
						'primeplaced-advanced-password-protection'
					)}
				>
					<Button
						size="compact"
						icon={reset}
						variant="tertiary"
						onClick={() => onChange(defaultValue)}
						aria-label={__( 'Restore default value',
							'primeplaced-advanced-password-protection'
						)}
						className="ppadvp-appearance-text-control-reset"
					/>
				</Tooltip>
			)}
		</div>
	);
};
