import { useState, useCallback, useEffect } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';
import { __ } from '@wordpress/i18n';
import { applyFilters } from '@wordpress/hooks';
import { useFrontContext } from '@shared/contexts/FrontContext';
import type { UseLockScreenProps, CheckResponse } from './types';

export const useLockScreen = ({
	logoUrl,
	isPreview = false,
	errorMsg = '',
}: UseLockScreenProps = {}) => {
	const [password, setPassword] = useState('');
	const [error, setError] = useState(errorMsg);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isImageLoading, setIsImageLoading] = useState(!!logoUrl);
	const [rememberMe, setRememberMe] = useState(false);

	const { frontData: vars } = useFrontContext();

	useEffect(() => {
		if (errorMsg) setError(errorMsg);
	}, [errorMsg]);

	const handlePasswordChange = useCallback(
		(value: string) => {
			setPassword(value);
			if (error) setError('');
		},
		[error]
	);

	const handleImageLoad = useCallback(() => {
		setIsImageLoading(false);
	}, []);

	const checkLockout = () => {
		if (isPreview) return false;
		const lockoutUntil = localStorage.getItem('ppadvp_lockout_time');
		if (lockoutUntil) {
			const untilTime = parseInt(lockoutUntil, 10);

			if (Date.now() < untilTime) {
				const minutesLeft = Math.ceil((untilTime - Date.now()) / 60000);

				setError(
					// Translators: %d is the number of minutes.
					__( 'Too many failed attempts. Please try again in ',
						'primeplaced-advanced-password-protection'
					) +
						minutesLeft +
						__( ' minutes.', 'primeplaced-advanced-password-protection')
				);

				return true;
			}
			localStorage.removeItem('ppadvp_lockout_time');
		}
		return false;
	};

	const handleSubmit = useCallback(
		async (e: React.FormEvent) => {
			e.preventDefault();
			if (isSubmitting) return;
			
			if (checkLockout()) {
				return;
			}

			if (!password.trim()) {
				setError(
					__( 'Please enter the password.',
						'primeplaced-advanced-password-protection'
					)
				);
				return;
			}
			setIsSubmitting(true);
			setError('');

			if (isPreview) {
				setTimeout(() => {
					setIsSubmitting(false);
					setError(
						vars?.design_settings?.errorMsg ||
							__( 'Incorrect password (preview error simulation).',
								'primeplaced-advanced-password-protection'
							)
					);
				}, 100);
				return;
			}

			try {
				let payload: Record<string, any> = {
					password,
					object_id: vars.object_id || 0,
					object_type: vars.object_type || 'post',
					remember_me: rememberMe,
				};

				payload = applyFilters(
					'ppadvp.password_form.submit_payload',
					payload
				) as typeof payload;

				const response = await apiFetch<CheckResponse>({
					path: '/ppadvp/v1/check-password',
					method: 'POST',
					data: payload,
					headers: vars.nonce
						? { 'X-WP-Nonce': vars.nonce }
						: undefined,
				});

				if (response.success) {
					window.location.reload();
				} else {
					throw new Error(
						response.message ||
							__( 'Invalid password.',
								'primeplaced-advanced-password-protection'
							)
					);
				}
			} catch (err: any) {
				setIsSubmitting(false);
				if (err.code === 'rate_limit_exceeded') {
					const until = Date.now() + 10 * 60 * 1000;
					localStorage.setItem('ppadvp_lockout_time', until.toString());
				}
				setError(
					err.message ||
						__( 'A connection error occurred.',
							'primeplaced-advanced-password-protection'
						)
				);
				applyFilters('ppadvp.password_form.submit_error', null, err);
			}
		},
		[password, isPreview, isSubmitting, rememberMe, vars]
	);

	return {
		password,
		error,
		isSubmitting,
		isImageLoading,
		rememberMe,
		setRememberMe,
		handlePasswordChange,
		handleSubmit,
		handleImageLoad,
	};
};
