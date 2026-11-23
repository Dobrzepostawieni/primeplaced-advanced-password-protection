import { applyFilters } from '@wordpress/hooks';
import { PpadvpToggler } from '@shared/components/PpadvpToggler';
import { PasswordModal } from '@shared/components/PasswordModal';
import { useSiteLock } from '@shared/hooks/useSiteLock';
import { ReactNode } from 'react';

export const SiteLockToggler = () => {
	const {
		isModalOpen,
		setIsModalOpen,
		isLockEnabled,
		isLoading,
		isSaving,
		toggleLock,
		handleSaveAndLock,
		statusHelp,
		statusLabel,
	} = useSiteLock();

	return (
		<>
			<PpadvpToggler
				label={statusLabel}
				checked={isLockEnabled}
				onChange={(val) => void toggleLock(val)}
				help={statusHelp}
				isLoading={isLoading}
				isSaving={isSaving}
				hasBorder
			/>

			{applyFilters('ppadvp.ui.ProtectionModeSelector', null) as ReactNode}

			<PasswordModal
				context="general"
				isOpen={isModalOpen}
				onRequestClose={() => setIsModalOpen(false)}
				initialEntry={null}
				onSave={handleSaveAndLock}
			/>
		</>
	);
};
