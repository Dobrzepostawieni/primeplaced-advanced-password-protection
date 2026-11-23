import type { PasswordEntry } from '@shared/types';

export const hasActivePassword = (passwords: PasswordEntry[]): boolean => {
	if (!passwords || passwords.length === 0) return false;

	const now = new Date();

	return passwords.some((entry) => {
		if (!entry.is_active) return false;

		if (entry.date_from) {
			if (new Date(entry.date_from) > now) return false;
		}
		if (entry.date_to) {
			if (new Date(entry.date_to) < now) return false;
		}

		return true;
	});
};

/**
 * Recreation of the native WordPress sanitize_text_field() function in TypeScript
 *
 * @param str Ciąg znaków do sanityzacji.
 * @return Oczyszczony ciąg znaków.
 */
export const sanitizeTextField = (str: string): string => {
	if (typeof str !== 'string' || !str) {
		return '';
	}

	let sanitized = str;

	sanitized = sanitized.replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/gi, '');
	sanitized = sanitized.replace(/<[^>]*>?/gm, '');

	sanitized = sanitized.replace(/</g, '&lt;');

	let previous;
	do {
		previous = sanitized;
		sanitized = sanitized.replace(/%[a-fA-F0-9]{2}/gi, '');
	} while (sanitized !== previous);

	sanitized = sanitized.replace(/[\r\n\t ]+/g, ' ').trim();

	return sanitized;
};

/**
 * Checks if the string contains unsafe characters (XSS/HTML).
 * Used for live validation, e.g., in password and rule modals.
 *
 * @param input Wpisany przez użytkownika tekst.
 * @return boolean True, jeśli zawiera niedozwolone znaki.
 */
export const hasUnsafeChars = (input: string): boolean => {
	if (!input) return false;

	const reg = /[<>&'"/]/gi;
	return reg.test(input);
};
