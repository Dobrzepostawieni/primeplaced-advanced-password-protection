/**
 * Types and interfaces for Shared Hooks.
 */

import type { FinalPasswordEntry } from '@shared/types';

/**
 * Result object returned after attempting to toggle the master site lock.
 */
export interface ToggleLockResult {
	/** Indicates whether the toggle operation was successful. */
	success: boolean;
	/** If success is false, provides the specific reason for failure. */
	reason?: 'no_passwords' | 'no_active_passwords' | string;
}

/**
 * Defines the structure of the object returned by the useSiteLock hook.
 */
export interface UseSiteLockReturn {
	/** Whether the global protection is currently enabled. */
	isLockEnabled: boolean;
	/** Whether a save operation is currently in progress. */
	isSaving: boolean;
	/** Whether the settings are currently loading from the database. */
	isLoading: boolean;
	/** Whether the prompt modal (for missing passwords) is open. */
	isModalOpen: boolean;
	/** Function to manually open or close the prompt modal. */
	setIsModalOpen: (isOpen: boolean) => void;
	/** Toggles the global site lock on or off. */
	toggleLock: (nextState: boolean) => Promise<ToggleLockResult>;
	/** Saves a new password and immediately enables the global site lock. */
	handleSaveAndLock: (entry: FinalPasswordEntry) => Promise<void>;
	/** Contextual help text explaining the current protection status. */
	statusHelp: string;
	/** The label to display on the main toggle button. */
	statusLabel: string;
}
