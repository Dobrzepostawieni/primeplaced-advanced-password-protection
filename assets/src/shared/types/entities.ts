/**
 * Core Entities Foundation.
 * Base types and environment data injected from PHP.
 */
import designSchema from '../../../../config/DesignSettingsSchema.json';

export type DesignSettings = typeof designSchema & {
	logoUrl?: string;
};

export type CookiesTypes = 'duration' | 'session';
export type ProtectionModes = 'global';
export type Plans = 'free';

/**
 * Color palette structure from the active theme.
 */
export interface ThemeColors {
	name: string;
	slug: string;
	color: string;
}

/**
 * Base structure for a single password entry.
 */
export interface PasswordEntry {
	id: string;
	name: string;
	password: string;
	is_active: boolean;
	author_id?: number | string;
	author_name?: string;
	author_role?: string;
	date_from?: string;
	date_to?: string;
}

/**
 * Base Settings from Rest
 */
export interface Settings {
	protection: boolean;
	password: PasswordEntry | null;
	design_settings: DesignSettings;
	cookie_type: CookiesTypes;
	cookie_days: number;
	session_salt: string;
}

/**
 * Base properties shared across all backend/admin React apps.
 */
export interface BaseAdminData {
	rest_url: string;
	nonce: string;
	active_plan: Plans;
	can_manage_settings: boolean;
	is_premium: boolean;
	has_fs_error: boolean;
}

/**
 * Read-only environment data injected from PHP (Core).
 */
export interface PpadvpAdminData extends BaseAdminData {
	default_design_settings: DesignSettings;
	theme_colors: ThemeColors[];
}

/**
 * Read-only frontend environment data injected from PHP.
 */
export interface PpadvpFrontendData {
	rest_url: string;
	nonce: string;
	design_settings: DesignSettings;
	error_msg: string | false;
	object_id: number;
	object_type: string;
	cookie_type: CookiesTypes;
	active_plan: Plans;
	enable_remember_me?: boolean;
}

/**
 * Google reCAPTCHA global object structure.
 */
export interface Grecaptcha {
	ready: (cb: () => void) => void;
	execute: (
		siteKey?: string,
		options?: { action: string }
	) => Promise<string>;
	getResponse: () => string;
	reset: () => void;
	render: (element: HTMLElement, options: any) => void;
}

/**
 * Data structure for the Dashboard Widget environment.
 */
export interface PpadvpWidgetData extends BaseAdminData {
	settings_url: string;
}
