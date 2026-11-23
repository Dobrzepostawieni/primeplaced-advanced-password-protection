import { __ } from '@wordpress/i18n';
import { useLockScreenData } from './LockScreenContext';
import { useLockScreen } from './useLockScreen';
import { PasswordForm } from './components/PasswordForm';
import pluginLogoUrl from '@images/ppadvp-logo.svg';

export const LockScreen = () => {
	const { settings, logoUrl, isPreview, runtimeError } = useLockScreenData();
	const { isImageLoading, handleImageLoad } = useLockScreen({
		logoUrl: logoUrl || undefined,
		isPreview,
		errorMsg: runtimeError,
	});

	if (!settings) return null;

	const shouldShowLogo = settings.logoDisplay ?? true;

	return (
		<main
			className="ppadvp-lock-screen-root"
			style={{ backgroundColor: settings.bgColor }}
		>
			<div className="ppadvp-lock-box">
				{shouldShowLogo && (
					<div className="ppadvp-lock-logo">
						{logoUrl ? (
							<picture>
								<img
									src={logoUrl}
									alt={__(
										'Logo',
										'primeplaced-advanced-password-protection'
									)}
									onLoad={handleImageLoad}
									style={{
										width: settings.logoWidth,
										height: settings.logoHeight,
										opacity:
											isPreview && isImageLoading ? 0 : 1,
									}}
								/>
							</picture>
						) : (
							<span className="ppadvp-lock-logo-placeholder">
								<img
									src={pluginLogoUrl}
									alt={__(
										'PrimePlaced - Password Protect Site & Staging',
										'primeplaced-advanced-password-protection'
									)}
								/>
							</span>
						)}
					</div>
				)}

				{settings.title ? (
					<div className="ppadvp-lock-content">
						<h1>{settings.title}</h1>
					</div>
				) : (
					<h1 className="ppadvp-screen-reader-text">
						{__(
							'Password-protected site',
							'primeplaced-advanced-password-protection'
						)}
					</h1>
				)}

				<PasswordForm />
			</div>
		</main>
	);
};
