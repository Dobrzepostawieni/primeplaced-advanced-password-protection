/**
 * Global Notices Configuration Scheme.
 * Defines standard notifications used throughout the application.
 */

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

export const noticeScheme = {
	SETTINGS_SESSION_TIMEOUT: {
		status: 'error',
		content: __('Session expired.', 'primeplaced-advanced-password-protection'),
		type: 'default',
	},
	SETTINGS_SAVE_SUCCESS: {
		status: 'success',
		content: __(
			'Settings saved successfully.',
			'primeplaced-advanced-password-protection'
		),
		type: 'snackbar',
	},
	SETTINGS_SAVE_ERROR: {
		status: 'error',
		content: __(
			'An error occurred while saving.',
			'primeplaced-advanced-password-protection'
		),
		type: 'default',
	},
	SETTINGS_FETCH_ERROR: {
		status: 'error',
		content: __('Error fetching settings.', 'primeplaced-advanced-password-protection'),
		type: 'default',
	},
	PASSWORD_REVEAL_ERROR: {
		status: 'error',
		content: __(
			'Unable to reveal the password.',
			'primeplaced-advanced-password-protection'
		),
		type: 'default',
	},
	PASSWORD_ADDED_SUCCESS: {
		status: 'success',
		content: __(
			'New password added successfully.',
			'primeplaced-advanced-password-protection'
		),
		type: 'snackbar',
	},
	LOCK_AUTO_ENABLED: {
		status: 'info',
		content: __(
			'Protection has been enabled automatically.',
			'primeplaced-advanced-password-protection'
		),
		type: 'snackbar',
	},
	LOCK_ENABLE_DENIED: {
		status: 'warning',
		content: __(
			'Cannot enable protection: no active or scheduled passwords.',
			'primeplaced-advanced-password-protection'
		),
		type: 'default',
	},
	LOCK_ENABLE_NO_ACTIVE_PASSWORDS: {
		status: 'warning',
		/* translators: %d: Maximum number of allowed passwords in the free version. */
		content: __(
			'Cannot enable protection. Please enable an existing password.',
			'primeplaced-advanced-password-protection'
		),
		type: 'default',
	},
	PASSWORD_DATE_PAST: {
		status: 'warning',
		content: __(
			'You are setting an expiration date in the past. The password will be inactive immediately.',
			'primeplaced-advanced-password-protection'
		),
		type: 'snackbar',
	},
	MEDIA_LIB_UNAVAILABLE: {
		status: 'error',
		content: __(
			'Media library is unavailable.',
			'primeplaced-advanced-password-protection'
		),
		type: 'default',
	},
	APPEARANCE_SAVE_SUCCESS: {
		status: 'success',
		content: __(
			'Appearance updated successfully.',
			'primeplaced-advanced-password-protection'
		),
		type: 'snackbar',
	},
	COOKIES_USERS_LOGOUT: {
		status: 'success',
		content: __(
			'All users have been logged out (session salt changed).',
			'primeplaced-advanced-password-protection'
		),
		type: 'snackbar',
	},
	COOKIES_ERROR: {
		status: 'error',
		content: __('Failed to force logout.', 'primeplaced-advanced-password-protection'),
		type: 'default',
	},
	RULES_AUTO_DEZACT: {
		status: 'warning',
		content: __(
			'Selected content protection mode disabled.',
			'primeplaced-advanced-password-protection'
		),
		type: 'default',
	},
	LIMIT_RULES_EXCEEDED: {
		status: 'warning',
		/* translators: %d: Maximum number of allowed active rules. */
		content: __(
			'Cannot enable Access Rules mode. Rule limit reached (%d). Please correctly configure your existing rules.',
			'primeplaced-advanced-password-protection'
		),
		type: 'default',
	},
	ADVANCED_EXPORT_SUCCESS: {
		status: 'success',
		content: __(
			'Settings exported successfully.',
			'primeplaced-advanced-password-protection'
		),
		type: 'snackbar',
	},
	ADVANCED_EXPORT_ERROR: {
		status: 'error',
		content: __(
			'Error exporting settings.',
			'primeplaced-advanced-password-protection'
		),
		type: 'default',
	},
	ADVANCED_IMPORT_SUCCESS: {
		status: 'success',
		content: __(
			'Settings imported successfully.',
			'primeplaced-advanced-password-protection'
		),
		type: 'snackbar',
	},
	ADVANCED_IMPORT_ERROR: {
		status: 'error',
		content: __(
			'Invalid JSON file or structure error.',
			'primeplaced-advanced-password-protection'
		),
		type: 'default',
	},
	ADVANCED_IMPORT_PLAN_ERROR: {
		status: 'error',
		content: __(
			'Your current plan only allows importing passwords. To import this configuration, upgrade to the Business plan.',
			'primeplaced-advanced-password-protection'
		),
		type: 'default',
	},
	ADVANCED_IMPORT_SECURITY_ERROR: {
		status: 'error',
		content: __(
			'The selected file contains unsafe HTML characters or scripts and cannot be imported for security reasons.',
			'primeplaced-advanced-password-protection'
		),
		type: 'default',
	},
	ADVANCED_EXPORT_PASSWORDS_ERROR: {
		status: 'error',
		content: __('No passwords to export.', 'primeplaced-advanced-password-protection'),
		type: 'default',
	},
	ADVANCED_EXPORT_PASSWORDS_SUCCESS: {
		status: 'success',
		content: __(
			'Password settings exported successfully.',
			'primeplaced-advanced-password-protection'
		),
		type: 'default',
	},
	FREEMIUS_API_ERROR: {
		status: 'error',
		content: __(
			'Licensing server connection error. Your subscription status could not be verified and some features may be temporarily unavailable.',
			'primeplaced-advanced-password-protection'
		),
		type: 'default',
	},
	FREEMIUS_BLOCKED: {
		status: 'warning',
		content: __(
			'Unable to load the licensing system. This might be caused by an AdBlocker, privacy extension, or a network issue.',
			'primeplaced-advanced-password-protection'
		),
		type: 'default',
	},
} as const;
