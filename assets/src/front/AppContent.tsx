import { useFrontContext } from '@shared/contexts/FrontContext';
import { LockScreen, LockScreenProvider } from '@shared/LockScreen';

export const AppContent = (): JSX.Element => {
	const { frontData } = useFrontContext();

	const runtimeError =
		typeof frontData.error_msg === 'string' &&
		frontData.error_msg.trim() !== ''
			? frontData.error_msg
			: '';

	return (
		<div>
			<LockScreenProvider
				value={{
					settings: frontData.design_settings,
					cookieType: frontData.cookie_type || 'duration',
					enableRememberMe: frontData.enable_remember_me ?? false,
					logoUrl: frontData.design_settings.logoUrl,
					isPreview: false,
					runtimeError,
					nonce: frontData.nonce,
					objectId: frontData.object_id,
					objectType: frontData.object_type,
				}}
			>
				<LockScreen />
			</LockScreenProvider>
		</div>
	);
};
