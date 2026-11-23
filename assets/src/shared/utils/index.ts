/**
 * Utility for generating UUIDs.
 */

/**
 * Generates a Universally Unique Identifier (UUID) version 4.
 *
 * Utilizes the native Crypto API if available, gracefully degrading to
 * mathematically generated fallbacks for older browser support.
 *
 * @return The generated UUID string.
 */
export const generateUuid = (): string => {
	const hasCryptoApi = typeof window !== 'undefined' && window.crypto;

	// Use the native, most secure, and fastest method if available.
	if (hasCryptoApi && window.crypto.randomUUID) {
		return window.crypto.randomUUID();
	}

	const uuidTemplate = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx';

	// Fallback using the Crypto API for cryptographically secure randomness.
	if (hasCryptoApi && window.crypto.getRandomValues) {
		return uuidTemplate.replace(/[xy]/g, (characterPlaceholder) => {
			const randomByteArray = new Uint8Array(1);
			window.crypto.getRandomValues(randomByteArray);

			const randomByte = randomByteArray[0];
			const randomHexValue = randomByte % 16;

			const finalHexValue =
				characterPlaceholder === 'x'
					? randomHexValue
					: /* eslint-disable no-bitwise */
					  (randomHexValue & 0x3) | 0x8;

			return finalHexValue.toString(16);
		});
	}

	// Ultimate fallback using Math.random() (least secure, but universally supported).
	return uuidTemplate.replace(/[xy]/g, (characterPlaceholder) => {
		const randomFloat = Math.random() * 16;
		const randomInteger = Math.floor(randomFloat);

		const finalHexValue =
			characterPlaceholder === 'x'
				? randomInteger
				: /* eslint-disable no-bitwise */
				  (randomInteger & 0x3) | 0x8;

		return finalHexValue.toString(16);
	});
};
