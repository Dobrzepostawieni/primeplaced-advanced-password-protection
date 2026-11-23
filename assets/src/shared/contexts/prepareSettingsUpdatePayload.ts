import type { SettingsUpdatePayload } from './types';

/**
 * Removes write-only placeholders returned by the settings endpoint.
 *
 * Empty placeholders mean "not disclosed", not "replace the saved secret".
 */
export const prepareSettingsUpdatePayload = (
	data: SettingsUpdatePayload
): SettingsUpdatePayload => {
	const payload = { ...data };

	if (payload.session_salt === '') {
		delete payload.session_salt;
	}

	if (payload.password?.password?.trim() === '') {
		const metadata = { ...payload.password };
		delete metadata.password;
		payload.password = metadata;
	}

	return payload;
};
