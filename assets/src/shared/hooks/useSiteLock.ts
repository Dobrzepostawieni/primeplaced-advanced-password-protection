/**
 * Hook for managing site-wide lock status.
 * Used in both Dashboard Widget and General Settings.
 */
import { useState, useCallback } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import {
	useSettingsState,
	useSettingsDispatch,
	useSettingsStateContext,
} from '@shared/contexts';
import { useNotices } from '@shared/components/Notices';
import type { FinalPasswordEntry } from '@shared/types';
import { usePasswords } from '@shared/hooks/usePasswords';

export const useSiteLock = () => {
	const [isModalOpen, setIsModalOpen] = useState(false);

	const { isLoading, isSaving } = useSettingsStateContext();
	const { updateSettings, saveSettings } = useSettingsDispatch();
	const { isLockEnabled, activePasswordsCount } = useSettingsState();
	const { savePassword, canAddMore } = usePasswords();
	const { notify } = useNotices();

	const toggleLock = useCallback(
		async (nextState: boolean) => {
			if (nextState && activePasswordsCount === 0) {
				if (!canAddMore) {
					notify('LOCK_ENABLE_NO_ACTIVE_PASSWORDS');
					return { success: false, reason: 'no_active_passwords' };
				}

				notify('LOCK_ENABLE_DENIED');
				setIsModalOpen(true);
				return { success: false, reason: 'no_passwords' };
			}

			updateSettings({ protection: nextState });
			const success = await saveSettings({ protection: nextState });
			return { success };
		},
		[
			activePasswordsCount,
			canAddMore,
			notify,
			updateSettings,
			saveSettings,
		]
	);

	const handleSaveAndLock = useCallback(
		async (entry: FinalPasswordEntry) => {
			await savePassword(entry, { protection: true });
			setIsModalOpen(false);
		},
		[savePassword]
	);

	const getStatusHelp = (): string => {
		if (!isLockEnabled) {
			return __( 'Protection system is disabled. All pages are publicly accessible.',
				'primeplaced-advanced-password-protection'
			);
		}
		if (activePasswordsCount > 0) {
			return __( 'All pages across the site require a password.',
				'primeplaced-advanced-password-protection'
			);
		}
		return __( 'Lock enabled, but there are no active passwords.',
			'primeplaced-advanced-password-protection'
		);
	};

	const getStatusLabel = (): string => {
		if (!isLockEnabled) {
			return __( 'Enable password protection',
				'primeplaced-advanced-password-protection'
			);
		}
		return __( 'Disable full site lock', 'primeplaced-advanced-password-protection');
	};

	return {
		isLockEnabled,
		isLoading,
		isSaving,
		isModalOpen,
		setIsModalOpen,
		toggleLock,
		handleSaveAndLock,
		statusHelp: getStatusHelp(),
		statusLabel: getStatusLabel(),
	};
};
