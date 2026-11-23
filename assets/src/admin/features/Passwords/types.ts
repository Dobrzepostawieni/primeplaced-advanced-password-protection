import type { FinalPasswordEntry } from '@shared/types';

export type PasswordModalContext = 'general' | 'table_add' | 'table_edit';

export type PasswordViewEntry = FinalPasswordEntry & {
	status_label?: string;
	status_class?: string;
	status_code?: string;
};

export interface PasswordsSectionContext {
	tableData: PasswordViewEntry[];
	isLoading: boolean;
	isSaving: boolean;
	canAddMore: boolean;
	canActivateMore: boolean;
	tablePageOptions: number[];
	openAddModal: () => void;
	openEditModal: (entry: FinalPasswordEntry) => void;
	requestDeletePasswords: (
		ids: string[],
		clearSelection?: () => void
	) => void;
	updateStatus: (id: string, status: boolean) => void;
	updatePassword: (
		id: string,
		partialData: Partial<FinalPasswordEntry>
	) => void;
}

export interface PasswordsContextValue {
	tableData: PasswordViewEntry[];
	isLoading: boolean;
	isSaving: boolean;
	canAddMore: boolean;
	tablePageOptions: number[];
	openAddModal: () => void;
	openMasterPasswordModal: () => void;
	openEditModal: (entry: FinalPasswordEntry) => void;
	requestDeletePasswords: (
		ids: string[],
		clearSelection?: () => void
	) => void;
	updateStatus: (id: string, status: boolean) => void;
}
