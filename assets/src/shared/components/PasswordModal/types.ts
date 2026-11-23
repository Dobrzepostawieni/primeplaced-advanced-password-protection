
/**
 * Types and interfaces for the Password Modal component.
 */

/**
 * Internal dependencies
 */
import type { FinalPasswordEntry } from '@shared/types';

/**
 * Represents validation errors within the password modal form.
 */
export interface PasswordModalFormErrors {
	/** Error message related to the password name field. */
	name?: string;
	/** Error message related to the password value field. */
	password?: string;
	/** Error message related to the password validity dates. */
	date?: string;
}

/**
 * Properties for the PasswordModal component.
 */
export interface PasswordModalProps {
	/** Determines whether the modal is currently visible on the screen. */
	isOpen: boolean;
	/** Callback function triggered when the modal is closed without saving. */
	onRequestClose: () => void;
	/** Callback function triggered when the user saves a valid password entry. */
	onSave: (savedEntry: FinalPasswordEntry) => void | Promise<void>;
	/** The existing password entry to edit, or null if creating a new one. */
	initialEntry: FinalPasswordEntry | null;
	/** Defines the visual context and text strings used within the modal interface. */
	context?: 'general' | 'table_add' | 'table_edit' | 'sidebar';
}