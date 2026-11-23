/**
 * Async Toggle Control Component.
 *
 * @package
 */

import { __ } from '@wordpress/i18n';
import {
	ToggleControl,
	Spinner,
	Placeholder,
	Animate,
} from '@wordpress/components';
import { cn } from '@shared/utils/formatting';

import type { PpadvpTogglerProps } from './types';

import './PpadvpToggler.scss';

export const PpadvpToggler = ({
	label,
	checked,
	onChange,
	help,
	isLoading = false,
	isSaving = false,
	disabled = false,
	className,
	hasBorder = false,
	isSmall = false,
	isPro = false,
}: PpadvpTogglerProps) => {
	if (isLoading) {
		return (
			<Placeholder
				className={cn(
					'ppadvp-toggle-control is-placeholder',
					hasBorder && 'ppadvp-toggle-control--border',
					isSmall && 'ppadvp-toggle-control--small',
					className
				)}
			>
				<Spinner />
				<Animate type="loading">
					{({ className: animClass }) => (
						<span
							className={cn(
								'components-toggle-control__label',
								animClass
							)}
						>
							{__('Loading…', 'primeplaced-advanced-password-protection')}
						</span>
					)}
				</Animate>
				<span className="components-base-control__help">
					{'\u00A0'}
				</span>
			</Placeholder>
		);
	}

	return (
		<ToggleControl
			className={cn(
				'ppadvp-toggle-control',
				hasBorder && 'has-border',
				isSmall && 'is-small',
				isPro && 'is-pro',
				isSaving && 'is-disabled',
				className
			)}
			label={
				<span
					className="ppadvp-toggle-control__label-wrapper"
					style={{
						display: 'flex',
						alignItems: 'center',
						gap: '8px',
					}}
				>
					<span>{label}</span>

					{isSaving && (
						<Spinner className="components-form-toggle__spinner" />
					)}
				</span>
			}
			checked={checked}
			onChange={onChange}
			help={help}
			disabled={disabled || isSaving}
		/>
	);
};
