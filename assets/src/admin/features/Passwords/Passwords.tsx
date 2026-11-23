/**
 * Passwords Settings Tab.
 *
 * @package
 */
import { useCallback, useMemo, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { applyFilters } from '@wordpress/hooks';
import { usePasswords } from '@shared/hooks/usePasswords';
import { PasswordModal } from '@shared/components/PasswordModal';
import { ConfirmModal } from '@admin/components/ConfirmModal';
import type { FinalPasswordEntry } from '@shared/types';
import type { SettingsComponentProps } from '@admin/components/AnimatedTabs';
import {
	StickyLayout,
	type StickySectionDef,
} from '@admin/components/StickyLayout';

import { MasterPasswordSection } from './components/MasterPasswordSection';
import { PasswordsContext } from './context';
import type {
	PasswordModalContext,
	PasswordsContextValue,
	PasswordsSectionContext,
} from './types';

import './Passwords.scss';

export const Passwords = ({ className }: SettingsComponentProps) => {
	const {
		isLoading,
		tableData,
		isSaving,
		savePassword,
		deletePassword,
		deleteMultiple,
		updateStatus,
		updatePassword,
		canAddMore,
		canActivateMore,
	} = usePasswords();

	const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
	const [passwordModalContext, setPasswordModalContext] =
		useState<PasswordModalContext>('table_add');
	const [selectedPasswordEntry, setSelectedPasswordEntry] =
		useState<FinalPasswordEntry | null>(null);
	const [bulkDeleteData, setBulkDeleteData] = useState<{
		ids: string[];
		clearSelection?: () => void;
	} | null>(null);

	const openAddModal = useCallback(() => {
		setSelectedPasswordEntry(null);
		setPasswordModalContext('table_add');
		setIsPasswordModalOpen(true);
	}, []);

	const openMasterPasswordModal = useCallback(() => {
		setSelectedPasswordEntry(null);
		setPasswordModalContext('table_add');
		setIsPasswordModalOpen(true);
	}, []);

	const openEditModal = useCallback((entry: FinalPasswordEntry) => {
		setSelectedPasswordEntry(entry);
		setPasswordModalContext('table_edit');
		setIsPasswordModalOpen(true);
	}, []);

	const requestDeletePasswords = useCallback(
		(ids: string[], clearSelection?: () => void) => {
			setBulkDeleteData({ ids, clearSelection });
		},
		[]
	);

	const tablePageOptions = useMemo(() => {
		return [10, 25, 50, 100];
	}, []);

	const confirmPasswordDeletion = async () => {
		if (!bulkDeleteData) return;

		if (bulkDeleteData.ids.length === 1) {
			await deletePassword(bulkDeleteData.ids[0]);
		} else {
			await deleteMultiple(bulkDeleteData.ids);
		}

		if (bulkDeleteData.clearSelection) bulkDeleteData.clearSelection();
		setBulkDeleteData(null);
	};

	const contextValue = useMemo<PasswordsContextValue>(
		() => ({
			tableData,
			isLoading,
			tablePageOptions,
			isSaving,
			canAddMore,
			openAddModal,
			openMasterPasswordModal,
			openEditModal,
			requestDeletePasswords,
			updateStatus,
		}),
		[
			tableData,
			isLoading,
			tablePageOptions,
			isSaving,
			canAddMore,
			openAddModal,
			openMasterPasswordModal,
			openEditModal,
			requestDeletePasswords,
			updateStatus,
		]
	);

	const sectionContext = useMemo<PasswordsSectionContext>(
		() => ({
			tableData,
			isLoading,
			isSaving,
			canAddMore,
			canActivateMore,
			tablePageOptions,
			openAddModal,
			openEditModal,
			requestDeletePasswords,
			updateStatus,
			updatePassword,
		}),
		[
			tableData,
			isLoading,
			isSaving,
			canAddMore,
			canActivateMore,
			tablePageOptions,
			openAddModal,
			openEditModal,
			requestDeletePasswords,
			updateStatus,
			updatePassword,
		]
	);

	const defaultSections: StickySectionDef[] = useMemo(
		() => [
			{
				id: 'master-password',
				title: __(
					'Master password',
					'primeplaced-advanced-password-protection'
				),
				component: MasterPasswordSection,
			},
		],
		[]
	);

	const sections: StickySectionDef[] = useMemo(
		() =>
			applyFilters(
				'ppadvp.passwords.sections',
				defaultSections,
				sectionContext
			) as StickySectionDef[],
		[defaultSections, sectionContext]
	);

	return (
		<PasswordsContext.Provider value={contextValue}>
			<StickyLayout
				title={__(
					'Passwords',
					'primeplaced-advanced-password-protection'
				)}
				sections={sections}
				className={className}
			/>
			<PasswordModal
				context={
					selectedPasswordEntry ? 'table_edit' : passwordModalContext
				}
				isOpen={isPasswordModalOpen}
				onRequestClose={() => setIsPasswordModalOpen(false)}
				initialEntry={selectedPasswordEntry}
				onSave={async (entryToSave) => {
					await savePassword(entryToSave);
					setIsPasswordModalOpen(false);
				}}
			/>
			{bulkDeleteData && (
				<ConfirmModal
					isOpen={true}
					title={
						bulkDeleteData.ids.length > 1
							? __(
									'Delete selected passwords?',
									'primeplaced-advanced-password-protection'
								)
							: __(
									'Delete password?',
									'primeplaced-advanced-password-protection'
								)
					}
					message={
						bulkDeleteData.ids.length > 1
							? __(
									'This will permanently delete all selected passwords.',
									'primeplaced-advanced-password-protection'
								)
							: __(
									'This will permanently delete the password.',
									'primeplaced-advanced-password-protection'
								)
					}
					confirmLabel={__(
						'Remove',
						'primeplaced-advanced-password-protection'
					)}
					onConfirm={confirmPasswordDeletion}
					onCancel={() => setBulkDeleteData(null)}
				/>
			)}
		</PasswordsContext.Provider>
	);
};
