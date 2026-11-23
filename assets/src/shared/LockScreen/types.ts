import type { DesignSettings, CookiesTypes } from '@shared/types/entities';

export interface PasswordFormProps {
	settings: DesignSettings;
	cookieType?: CookiesTypes | string;
	enableRememberMe?: boolean;
	isPreview?: boolean;
	errorMsg?: string;
	style?: React.CSSProperties;
	objectId?: number;
	objectType?: string;
}

export interface UseLockScreenProps {
	logoUrl?: string;
	isPreview?: boolean;
	errorMsg?: string;
}

export interface CheckResponse {
	success: boolean;
	message?: string;
	code?: string;
}

export interface LockScreenProps {
	settings: DesignSettings;
	cookieType?: CookiesTypes | string;
	enableRememberMe?: boolean;
	logoUrl?: string | null;
	isPreview?: boolean;
	runtimeError?: string;
}
