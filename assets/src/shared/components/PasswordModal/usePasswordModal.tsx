/**
 * Password Modal Logic Hook.
 *
 * @package
 */
import { useState, useEffect, useMemo, useCallback } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { applyFilters } from '@wordpress/hooks';
import { useSettingsState } from '@shared/contexts';
import { hasUnsafeChars, sanitizeTextField } from '@shared/utils/validation';
import type { FinalPasswordEntry } from '@shared/types';
import type { PasswordModalFormErrors, PasswordModalProps } from './types';

export const usePasswordModal = ({
	isOpen,
	initialEntry,
	context,
	onSave,
}: Omit<PasswordModalProps, 'onRequestClose'>) => {
	const { passwordEntries } = useSettingsState();
	const defaultEntry: FinalPasswordEntry = {
		id: '',
		name: '',
		password: '',
		is_active: true,
		date_from: '',
		date_to: '',
	};
	const [currentEntry, setCurrentEntry] =
		useState<FinalPasswordEntry>(defaultEntry);
	const [isPasswordVisible, setIsPasswordVisible] = useState(false);
	const [touched, setTouched] = useState<Record<string, boolean>>({});
	const [isCleaning, setIsCleaning] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const isEditing = Boolean(initialEntry?.id);

	useEffect(() => {
		if (isOpen) {
			setCurrentEntry(
				initialEntry ? { ...initialEntry } : { ...defaultEntry }
			);
			setIsPasswordVisible(false);
			setTouched({});
			setIsCleaning(false);
			setIsSubmitting(false);
		}
	}, [isOpen, initialEntry]);

	const isDirty = useMemo(() => {
		const base = initialEntry || defaultEntry;
		return JSON.stringify(currentEntry) !== JSON.stringify(base);
	}, [currentEntry, initialEntry]);

	const draftNameNormalized = (currentEntry.name || '').trim().toLowerCase();
	const isNameEmpty = !draftNameNormalized;
	const isNameUnsafe = hasUnsafeChars(currentEntry.name || '');
	const isNameValid = !isNameEmpty && !isNameUnsafe;

	const passStr = currentEntry.password || '';
	const isPasswordEmpty = !passStr.trim();
	const isPasswordUnsafe = hasUnsafeChars(passStr);
	const isPasswordTooShort =
		passStr.trim().length > 0 && passStr.trim().length < 6;
	const isPasswordValid =
		(isEditing && isPasswordEmpty) ||
		(!isPasswordEmpty && !isPasswordUnsafe && !isPasswordTooShort);

	const errors = useMemo(() => {
		const errs: PasswordModalFormErrors = {};
		if (isSubmitting) {
			return errs;
		}

		if (isNameEmpty)
			errs.name = __(
				'Name is required.',
				'primeplaced-advanced-password-protection'
			);
		else if (isNameUnsafe)
			errs.name = __(
				'The name contains invalid special characters.',
				'primeplaced-advanced-password-protection'
			);

		if (isPasswordEmpty && !isEditing)
			errs.password = __(
				'Password is required.',
				'primeplaced-advanced-password-protection'
			);
		else if (isPasswordTooShort)
			errs.password = __(
				'Password must be at least 6 characters long.',
				'primeplaced-advanced-password-protection'
			);

		return applyFilters(
			'ppadvp.password_modal.validation',
			errs,
			currentEntry,
			passwordEntries
		) as PasswordModalFormErrors;
	}, [
		isNameEmpty,
		isNameUnsafe,
		isPasswordEmpty,
		isEditing,
		isPasswordTooShort,
		currentEntry,
		passwordEntries,
		isSubmitting,
	]);

	const canSave =
		isNameValid &&
		isPasswordValid &&
		Object.keys(errors).length === 0 &&
		!isCleaning &&
		isDirty;

	const update = useCallback((key: keyof FinalPasswordEntry, val: any) => {
		setTouched((prev) => ({ ...prev, [key]: true }));
		setCurrentEntry((prev) => ({ ...prev, [key]: val }));
	}, []);

	const generateSecurePassword = () => {
		setIsCleaning(true);
		const allowedCharacters =
			'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@*-_';
		const charsLen = allowedCharacters.length;
		const maxValid = 256 - (256 % charsLen);
		let generatedPassword = '';
		const randomBytes = new Uint8Array(1);
		while (generatedPassword.length < 12) {
			window.crypto.getRandomValues(randomBytes);
			if (randomBytes[0] < maxValid) {
				generatedPassword +=
					allowedCharacters[randomBytes[0] % charsLen];
			}
		}

		update('password', generatedPassword);
		setIsPasswordVisible(true);
		if (navigator && navigator.clipboard) {
			navigator.clipboard.writeText(generatedPassword).catch(() => {});
		}
		setTimeout(() => {
			const passwordInput = document.getElementById(
				'ppadvp-modal-password-input'
			) as HTMLInputElement;
			if (passwordInput) {
				passwordInput.focus();
				passwordInput.select();
			}
			setIsCleaning(false);
		}, 100);
	};

	const modalStrings = useMemo(() => {
		const strings = {
			general: {
				title: __(
					'Lock Configuration',
					'primeplaced-advanced-password-protection'
				),
				helpText: __(
					'To enable full-page protection, you must first set a master password.',
					'primeplaced-advanced-password-protection'
				),
				saveButtonLabel: __(
					'Save and enable the lock',
					'primeplaced-advanced-password-protection'
				),
			},
			table_add: {
				title: __(
					'Set password',
					'primeplaced-advanced-password-protection'
				),
				helpText: __(
					'Set up an access name and password.',
					'primeplaced-advanced-password-protection'
				),
				saveButtonLabel: __(
					'Save password',
					'primeplaced-advanced-password-protection'
				),
			},
			table_edit: {
				title: __(
					'Edit password',
					'primeplaced-advanced-password-protection'
				),
				helpText: __(
					'Change access name or password.',
					'primeplaced-advanced-password-protection'
				),
				saveButtonLabel: __(
					'Save changes',
					'primeplaced-advanced-password-protection'
				),
			},
			sidebar: {
				title: __(
					'Quick add',
					'primeplaced-advanced-password-protection'
				),
				helpText: __(
					'The password will be assigned to the current item.',
					'primeplaced-advanced-password-protection'
				),
				saveButtonLabel: __(
					'Add and assign',
					'primeplaced-advanced-password-protection'
				),
			},
		};
		return strings[context || 'table_add'] || strings.table_add;
	}, [context]);

	const handleSave = async () => {
		setTouched({ name: true, password: true });
		if (!canSave) return;
		const safeEntry = {
			...currentEntry,
			name: sanitizeTextField(currentEntry.name || ''),
		};
		setIsSubmitting(true);
		try {
			await onSave(safeEntry);
			setCurrentEntry(defaultEntry);
			setTouched({});
		} catch (e) {
			setIsSubmitting(false);
		}
	};

	return {
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
		update,
		generateSecurePassword,
		modalStrings,
		handleSave,
		errors,
	};
};
