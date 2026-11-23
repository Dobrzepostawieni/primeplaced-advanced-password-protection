/**
 * Main exports for core entities (Free Only).
 *
 * @package
 */
import type {
	PpadvpAdminData,
	Settings,
	PpadvpFrontendData,
	Grecaptcha,
	PasswordEntry,
	ProtectionModes,
	Plans,
	CookiesTypes,
} from './entities';

/**
 * Final entity versions containing all possible fields.
 */
export type FinalPasswordEntry = PasswordEntry;

/**
 * Unified type for all possible settings data objects.
 */
export type AppSettings = Settings;

/**
 * Unified type for all possible admin-side data objects.
 */
export type PpadvpData = PpadvpAdminData;

/**
 * Unified type for all possible front-side data objects.
 */
export type PpadvpFrontData = PpadvpFrontendData;

export type {
	Settings,
	Grecaptcha,
	PasswordEntry,
	ProtectionModes,
	Plans,
	CookiesTypes,
};
