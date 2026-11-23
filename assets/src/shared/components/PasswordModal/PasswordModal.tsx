/**
 * Password Modal Component (UI).
 *
 * @package
 */
import {
	KeyboardEvent as ReactKeyboardEvent,
	MouseEvent,
	ReactNode,
} from 'react';
import { useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { update, seen, unseen } from '@wordpress/icons';
import { applyFilters } from '@wordpress/hooks';
import {
	Modal,
	Button,
	TextControl,
	Tooltip,
	Spinner,
} from '@wordpress/components';
import { ConfirmModal } from '@admin/components/ConfirmModal';
import { usePasswordModal } from './usePasswordModal';
import type { PasswordModalProps } from './types';
import { cn } from '@shared/utils/formatting';
import './PasswordModal.scss';

export const PasswordModal = (props: PasswordModalProps) => {
	const { isOpen, onRequestClose } = props;
	const [isConfirmOpen, setIsConfirmOpen] = useState(false);
	const {
		currentEntry,
		setCurrentEntry,
		isPasswordVisible,
		setIsPasswordVisible,
		isNameEmpty,
		isNameUnsafe,
		isNameValid,
		isPasswordEmpty,
		isPasswordUnsafe,
		isPasswordTooShort,
		isPasswordValid,
		isEditing,
		touched,
		setTouched,
		isCleaning,
		isSubmitting,
		canSave,
		isDirty,
		update: updateField,
		generateSecurePassword,
		modalStrings,
		handleSave,
		errors,
	} = usePasswordModal(props);

	if (!isOpen) {
		if (isConfirmOpen) setIsConfirmOpen(false);
		return null;
	}

	const handleCloseAttempt = (e?: React.SyntheticEvent | KeyboardEvent) => {
		e?.preventDefault();
		e?.stopPropagation();
		if (isConfirmOpen || isSubmitting) return;
		if (isDirty) {
			setIsConfirmOpen(true);
		} else {
			onRequestClose();
		}
	};

	const handleFocusTrapKeyDown = (
		event: ReactKeyboardEvent<HTMLDivElement>
	) => {
		if (event.key !== 'Tab') {
			return;
		}

		const dialog =
			event.currentTarget.closest<HTMLElement>('[role="dialog"]');
		if (!dialog) {
			return;
		}

		const focusable = Array.from(
			dialog.querySelectorAll<HTMLElement>(
				'a[href], button:not([disabled]), input:not([disabled]), ' +
					'select:not([disabled]), textarea:not([disabled]), ' +
					'[tabindex]:not([tabindex="-1"])'
			)
		).filter((element) => element.getAttribute('aria-hidden') !== 'true');
		const currentIndex = focusable.indexOf(
			event.currentTarget.ownerDocument.activeElement as HTMLElement
		);

		if (focusable.length < 2 || currentIndex < 0) {
			return;
		}

		const nextIndex = event.shiftKey
			? (currentIndex - 1 + focusable.length) % focusable.length
			: (currentIndex + 1) % focusable.length;

		event.preventDefault();
		focusable[nextIndex].focus();
	};

	const getNameHelpText = () => {
		if (!touched.name || isSubmitting) return undefined;
		if (isNameEmpty)
			return __(
				'Name is required.',
				'primeplaced-advanced-password-protection'
			);
		if (isNameUnsafe)
			return __(
				'The name contains invalid special characters.',
				'primeplaced-advanced-password-protection'
			);
		return errors.name;
	};

	const getPasswordHelpText = () => {
		if (isEditing && isPasswordEmpty) {
			return __(
				'Leave blank to keep the current password.',
				'primeplaced-advanced-password-protection'
			);
		}
		if (!touched.password || isSubmitting) return undefined;
		if (isPasswordEmpty)
			return __(
				'Password is required.',
				'primeplaced-advanced-password-protection'
			);
		if (isPasswordUnsafe)
			return __(
				'Password cannot contain HTML tags (<, >).',
				'primeplaced-advanced-password-protection'
			);
		if (isPasswordTooShort)
			return __(
				'Password must be at least 6 characters long.',
				'primeplaced-advanced-password-protection'
			);
		return errors.password;
	};

	return (
		<>
			<Modal
				title={modalStrings.title}
				onRequestClose={handleCloseAttempt}
				onKeyDown={handleFocusTrapKeyDown}
				focusOnMount="firstInputElement"
				shouldCloseOnClickOutside={
					!isDirty && !isConfirmOpen && !isSubmitting
				}
				className={cn(
					'ppadvp-modal ppadvp-modal--passwords ppadvp-admin-modal',
					isDirty && 'ppadvp-modal-dirty'
				)}
			>
				<div
					className="ppadvp-modal-body"
					style={{ position: 'relative' }}
				>
					{isCleaning && (
						<div
							style={{
								position: 'absolute',
								top: 10,
								right: 10,
								zIndex: 10,
							}}
						>
							<Spinner />
						</div>
					)}
					{modalStrings.helpText && (
						<p className="ppadvp-modal-text">
							{modalStrings.helpText}
						</p>
					)}
					<TextControl
						label={__(
							'Display name',
							'primeplaced-advanced-password-protection'
						)}
						value={currentEntry.name}
						onChange={(val) => updateField('name', val)}
						onBlur={() => setTouched((p) => ({ ...p, name: true }))}
						help={getNameHelpText()}
						disabled={isSubmitting}
						className={cn(
							'ppadvp-text-control is-required',
							touched.name &&
								(!isNameValid || errors.name) &&
								!isSubmitting &&
								'has-error'
						)}
						__next40pxDefaultSize
						autoComplete="off"
					/>
					<div className="ppadvp-passwords-wrapper">
						<TextControl
							id="ppadvp-modal-password-input"
							label={__(
								'Password',
								'primeplaced-advanced-password-protection'
							)}
							value={currentEntry.password || ''}
							onChange={(val) => updateField('password', val)}
							onBlur={() =>
								setTouched((p) => ({ ...p, password: true }))
							}
							type={isPasswordVisible ? 'text' : 'password'}
							help={getPasswordHelpText()}
							disabled={isSubmitting}
							className={cn(
								'ppadvp-text-control',
								!isEditing && 'is-required',
								touched.password &&
									(!isPasswordValid || errors.password) &&
									!isSubmitting &&
									'has-error'
							)}
							__next40pxDefaultSize
						/>
						<div className="ppadvp-passwords-actions">
							<Tooltip
								text={__(
									'Generate secure password',
									'primeplaced-advanced-password-protection'
								)}
							>
								<Button
									icon={update}
									size="small"
									onMouseDown={(e: MouseEvent) =>
										e.preventDefault()
									}
									onClick={generateSecurePassword}
									className="ppadvp-button"
									disabled={isCleaning || isSubmitting}
								/>
							</Tooltip>
							<Tooltip
								text={
									isPasswordVisible
										? __(
												'Hide',
												'primeplaced-advanced-password-protection'
											)
										: __(
												'Show',
												'primeplaced-advanced-password-protection'
											)
								}
							>
								<Button
									icon={isPasswordVisible ? unseen : seen}
									size="small"
									onMouseDown={(e: MouseEvent) =>
										e.preventDefault()
									}
									onClick={() =>
										setIsPasswordVisible(!isPasswordVisible)
									}
									className="ppadvp-button"
									disabled={isSubmitting}
								/>
							</Tooltip>
						</div>
					</div>
					{
						applyFilters(
							'ppadvp.password_modal.fields_after_password',
							null,
							currentEntry,
							setCurrentEntry,
							errors
						) as ReactNode
					}
					<div className="ppadvp-modal-footer">
						<div className="ppadvp-modal-footer-actions">
							<Button
								variant="tertiary"
								onClick={handleCloseAttempt}
								className="ppadvp-button"
								disabled={isCleaning || isSubmitting}
							>
								{__(
									'Cancel',
									'primeplaced-advanced-password-protection'
								)}
							</Button>
							<Button
								variant="primary"
								onClick={handleSave}
								className="ppadvp-button"
								disabled={!canSave || isSubmitting}
								isBusy={isSubmitting}
							>
								{modalStrings.saveButtonLabel}
							</Button>
						</div>
					</div>
				</div>
			</Modal>
			{isConfirmOpen && (
				<ConfirmModal
					isOpen={isConfirmOpen}
					title={__(
						'Unsaved changes',
						'primeplaced-advanced-password-protection'
					)}
					message={__(
						'You have unsaved changes in this password. Are you sure you want to exit and discard progress?',
						'primeplaced-advanced-password-protection'
					)}
					confirmLabel={__(
						'Yes, discard changes',
						'primeplaced-advanced-password-protection'
					)}
					cancelLabel={__(
						'Return to Edit',
						'primeplaced-advanced-password-protection'
					)}
					onConfirm={() => {
						setIsConfirmOpen(false);
						onRequestClose();
					}}
					onCancel={() => setIsConfirmOpen(false)}
					isDestructive={true}
				/>
			)}
		</>
	);
};
