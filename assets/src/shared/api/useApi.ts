/**
 * API Wrapper Hook.
 * Handles nonce injection and global error catching.
 *
 * @package
 */
import { useCallback, useRef } from '@wordpress/element';
import apiFetch, { type APIFetchOptions } from '@wordpress/api-fetch';
import { useNotices } from '@shared/components/Notices/useNotices';

let isSessionDead = false;

if (typeof window !== 'undefined' && (window as any).jQuery) {
	(window as any).jQuery(document).on('heartbeat-tick.wp-auth-check', () => {
		isSessionDead = false;
	});
}

apiFetch.use((options, next) => {
	if (isSessionDead) {
		return Promise.reject(
			new Error('PPADVP: Session expired. Blocked outgoing request.')
		);
	}

	return next(options).catch((error: any) => {
		if (
			error?.code === 'rest_cookie_invalid_nonce' ||
			error?.status === 403 ||
			error?.status === 401
		) {
			if (!isSessionDead) {
				isSessionDead = true;

				if ((window as any).jQuery) {
					(window as any)
						.jQuery(document)
						.trigger('heartbeat-tick.wp-auth-check', [
							{ 'wp-auth-check': false },
						]);
				}
			}
		}
		throw error;
	});
});

/**
 *
 */
export function useApi() {
	const { notify } = useNotices();
	const hasFatalError = useRef(isSessionDead);

	const fetchApi = useCallback(
		async <T>(options: Omit<APIFetchOptions<any>, 'parse'>): Promise<T> => {
			if (isSessionDead || hasFatalError.current) {
				return Promise.reject(
					new Error(
						'PPADVP: Session expired. Blocked outgoing request.'
					)
				);
			}

			try {
				const fetchOptions: APIFetchOptions<any> = {
					...options,
					headers: {
						'X-WP-Nonce': window.ppadvpAdminData?.nonce || '',
						...options.headers,
					},
				};

				return await apiFetch<T>(fetchOptions);
			} catch (error: any) {
				if (isSessionDead && !hasFatalError.current) {
					hasFatalError.current = true;
					notify('SETTINGS_SESSION_TIMEOUT');
				}
				throw error;
			}
		},
		[notify]
	);

	return { fetchApi, hasFatalError };
}
