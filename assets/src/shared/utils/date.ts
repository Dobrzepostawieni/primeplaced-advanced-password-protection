/**
 * Date utilities for the plugin.
 */

import { __ } from '@wordpress/i18n';

/**
 * Returns the current date and time in local ISO format (YYYY-MM-DDTHH:mm).
 * Used primarily for <input type="datetime-local" /> initialization.
 *
 * @param date Optional date object, defaults to now.
 * @return Formatted local ISO string.
 */
export const getLocalISOString = (date: Date = new Date()): string => {
	const tzOffset = date.getTimezoneOffset() * 60000;
	const localISOTime = new Date(date.getTime() - tzOffset)
		.toISOString()
		.slice(0, 16); // YYYY-MM-DDTHH:mm
	return localISOTime;
};

/**
 * Formats a date string for display in the table.
 * Fallback to standard toLocaleString if WordPress dateI18n is not available.
 *
 * @param dateString ISO date string.
 * @return Formatted date or placeholder.
 */
export const formatWpDate = (dateString: string | null | undefined): string => {
	if (!dateString) {
		return '—';
	}

	const date = new Date(dateString);
	if (isNaN(date.getTime())) {
		return __('Invalid Date', 'primeplaced-advanced-password-protection');
	}

	return date.toLocaleString();
};
