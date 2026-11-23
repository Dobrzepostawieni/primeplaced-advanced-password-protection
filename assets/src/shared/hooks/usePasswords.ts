/**
 * Passwords Management Hook.
 * Implements Optimistic UI Updates and Partial Payload saving.
 *
 * @package
 */
import { useCallback, useMemo, useState } from '@wordpress/element';
import { applyFilters } from '@wordpress/hooks';
import {
	useSettingsStateContext,
	useSettingsDispatch,
	useSettingsState,
} from '@shared/contexts';
import { generateUuid } from '@shared/utils';
import {
	getProtectionStatusUI,
	analyzePasswords,
} from '@shared/utils/passwordStatus';
import type { FinalPasswordEntry } from '@shared/types';
import type { SettingsUpdatePayload } from '@shared/contexts/types';

export const usePasswords = () => {
	const { settings } = useSettingsStateContext();
	const { saveSettings, updateSettings, discard } = useSettingsDispatch();
	const { passwordEntries, activePasswordsCount } = useSettingsState();
	const [isProcessing, setIsProcessing] = useState(false);

	const supportsMultiple = applyFilters(
		'ppadvp.passwords.supports_multiple',
		false
	) as boolean;

	const canAddMore = applyFilters(
		'ppadvp.passwords.can_add_more',
		passwordEntries.length === 0,
		passwordEntries
	) as boolean;

	const canActivateMore = applyFilters(
		'ppadvp.passwords.can_activate_more',
		true,
		passwordEntries,
		activePasswordsCount
	) as boolean;

	const synchronize = useCallback(
		async (
			updatedList: FinalPasswordEntry[],
			extraPayload: Partial<SettingsUpdatePayload> = {}
		) => {
			setIsProcessing(true);
			let nextProtectionStatus = settings?.protection ?? false;
			const remainingActive = updatedList.filter(
				(p) => p.is_active
			).length;

			if (settings?.protection && remainingActive === 0) {
				nextProtectionStatus = false;
				updateSettings({ protection: false });
			}

			const basePayload: SettingsUpdatePayload = {
				password: updatedList.length > 0 ? updatedList[0] : null,
				protection: nextProtectionStatus,
				...extraPayload,
			};

			const filteredPayload = applyFilters(
				'ppadvp.passwords.sync_payload',
				basePayload,
				updatedList,
				settings
			) as SettingsUpdatePayload;

			// @ts-ignore - Pro filters may inject keys outside of free AppSettings
			updateSettings(filteredPayload);

			try {
				const success = await saveSettings(filteredPayload);
				if (!success) {
					discard();
				}
			} catch (e) {
				discard();
			} finally {
				setIsProcessing(false);
			}
		},
		[settings, saveSettings, updateSettings, discard]
	);

	const savePassword = useCallback(
		async (
			entry: FinalPasswordEntry,
			extraPayload?: Partial<SettingsUpdatePayload>
		): Promise<FinalPasswordEntry> => {
			let newList: FinalPasswordEntry[];
			const entryToSave = { ...entry };

			if (entryToSave.id) {
				newList = passwordEntries.map((p) =>
					p.id === entryToSave.id ? entryToSave : p
				);
			} else {
				if (!canAddMore) throw new Error('NOT_SUPPORTED');
				entryToSave.id = generateUuid();
				newList = [...passwordEntries, entryToSave];
			}

			await synchronize(newList, extraPayload);
			return entryToSave;
		},
		[passwordEntries, synchronize, canAddMore]
	);

	const deletePassword = useCallback(
		async (id: string) => {
			const newList = passwordEntries.filter((p) => p.id !== id);
			await synchronize(newList);
		},
		[passwordEntries, synchronize]
	);

	const deleteMultiple = useCallback(
		async (ids: string[]) => {
			const idsSet = new Set(ids);
			const newList = passwordEntries.filter((p) => !idsSet.has(p.id));
			await synchronize(newList);
		},
		[passwordEntries, synchronize]
	);

	const updateStatus = useCallback(
		async (id: string, status: boolean) => {
			if (status && !canActivateMore) throw new Error('NOT_SUPPORTED');
			const newList = passwordEntries.map((p) =>
				p.id === id ? { ...p, is_active: status } : p
			);
			await synchronize(newList);
		},
		[passwordEntries, synchronize, canActivateMore]
	);

	const updatePassword = useCallback(
		async (id: string, partialData: Partial<FinalPasswordEntry>) => {
			const newList = passwordEntries.map((p) =>
				p.id === id ? { ...p, ...partialData } : p
			);
			await synchronize(newList);
		},
		[passwordEntries, synchronize]
	);

	const tableData = useMemo(() => {
		return passwordEntries.map((password) => {
			const stats = analyzePasswords([password.id], passwordEntries);
			const { config: statusUI } = getProtectionStatusUI(
				password.is_active,
				true,
				stats,
				'password'
			);
			return {
				...password,
				status_label: statusUI.label,
				status_class: statusUI.className,
				status_code: statusUI.code,
			};
		});
	}, [passwordEntries]);

	return {
		isLoading: false,
		isSaving: isProcessing,
		passwordEntries,
		tableData,
		supportsMultiple,
		canAddMore,
		canActivateMore,
		savePassword,
		deletePassword,
		deleteMultiple,
		updateStatus,
		updatePassword,
	};
};