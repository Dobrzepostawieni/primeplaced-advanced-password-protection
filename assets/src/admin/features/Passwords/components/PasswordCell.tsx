import { __ } from '@wordpress/i18n';
import { Button, Tooltip } from '@wordpress/components';
import { seen, unseen } from '@wordpress/icons';
import type { FinalPasswordEntry } from '@shared/types';
import { usePasswordReveal } from '../hooks/usePasswordReveal';

import './PasswordCell.scss';

interface PasswordCellProps {
	entry: FinalPasswordEntry;
	isActivationLocked: boolean;
}

export const PasswordCell = ({
	entry,
	isActivationLocked,
}: PasswordCellProps) => {
	const {
		revealedPassword,
		isLoading,
		togglePasswordVisibility,
	} = usePasswordReveal(entry.id);
	const isPasswordVisible = revealedPassword !== null;

	const handleInputFocus = (event: React.FocusEvent<HTMLInputElement>) => {
		if (isPasswordVisible) {
			event.target.select();
		}
	};

	const toggleLabel = isPasswordVisible
		? __( 'Hide password', 'primeplaced-advanced-password-protection')
		: __( 'Show password', 'primeplaced-advanced-password-protection');

	return (
		<div className="ppadvp-datatable__cell-box">
			<Tooltip text={toggleLabel}>
				<Button
					icon={isPasswordVisible ? unseen : seen}
					size="small"
					variant="tertiary"
					disabled={isActivationLocked || isLoading}
					isBusy={isLoading}
					onClick={() => void togglePasswordVisibility()}
					aria-label={toggleLabel}
					aria-busy={isLoading}
					className="ppadvp-button"
				/>
			</Tooltip>
			<input
				type={isPasswordVisible ? 'text' : 'password'}
				value={revealedPassword ?? '••••••'}
				readOnly
				onFocus={handleInputFocus}
				className="ppadvp-password-cell-input"
				style={{
					cursor: isPasswordVisible ? 'text' : 'default',
				}}
				aria-label={__( 'Access password value',
					'primeplaced-advanced-password-protection'
				)}
			/>
		</div>
	);
};
