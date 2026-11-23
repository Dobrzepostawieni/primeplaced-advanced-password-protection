import { useCallback, useEffect, useRef, useState } from '@wordpress/element';
import { useApi } from '@shared/api/useApi';
import { useNotices } from '@shared/components/Notices';

const REVEAL_TIMEOUT_MS = 30_000;

type PasswordRevealResponse = {
	password: string;
};

export const usePasswordReveal = (passwordId: string) => {
	const { fetchApi } = useApi();
	const { notify } = useNotices();
	const [revealedPassword, setRevealedPassword] = useState<string | null>(
		null
	);
	const [isLoading, setIsLoading] = useState(false);
	const requestGeneration = useRef(0);

	useEffect(() => {
		requestGeneration.current += 1;
		setRevealedPassword(null);
		setIsLoading(false);

		return () => {
			requestGeneration.current += 1;
		};
	}, [passwordId]);

	useEffect(() => {
		if (revealedPassword === null) {
			return;
		}

		const timeoutId = window.setTimeout(
			() => setRevealedPassword(null),
			REVEAL_TIMEOUT_MS
		);

		return () => window.clearTimeout(timeoutId);
	}, [revealedPassword]);

	const togglePasswordVisibility = useCallback(async () => {
		if (revealedPassword !== null) {
			setRevealedPassword(null);
			return;
		}

		setIsLoading(true);
		const generation = requestGeneration.current;
		try {
			const response = await fetchApi<PasswordRevealResponse>({
				path: '/ppadvp/v1/password/reveal',
				method: 'POST',
				data: { id: passwordId },
			});

			if (
				!response ||
				typeof response.password !== 'string' ||
				response.password.length === 0
			) {
				throw new Error('Invalid password reveal response.');
			}

			if (generation === requestGeneration.current) {
				setRevealedPassword(response.password);
			}
		} catch (error) {
			if (generation === requestGeneration.current) {
				setRevealedPassword(null);
				notify('PASSWORD_REVEAL_ERROR');
			}
		} finally {
			if (generation === requestGeneration.current) {
				setIsLoading(false);
			}
		}
	}, [fetchApi, notify, passwordId, revealedPassword]);

	return {
		revealedPassword,
		isLoading,
		togglePasswordVisibility,
	};
};
