import { createContext, useContext } from '@wordpress/element';
import type { DesignSettings } from '@shared/types/entities';

export interface LockScreenData {
	settings: DesignSettings;
	cookieType: string;
	enableRememberMe: boolean;
	logoUrl?: string | null;
	isPreview: boolean;
	runtimeError: string;
	nonce?: string;
	objectId?: number;
	objectType?: string;
}

const LS_KEY = 'PpadvpLockScreenContext_v1';
if (!(window as any)[LS_KEY]) {
	(window as any)[LS_KEY] = createContext<LockScreenData | undefined>(undefined);
}
const LockScreenContext = (window as any)[LS_KEY];

export const useLockScreenData = () => {
	const context = useContext(LockScreenContext);
	if (!context) {
		throw new Error(
			'LockScreen components must be wrapped in a LockScreenProvider'
		);
	}
	return context as LockScreenData;
};

export const LockScreenProvider = ({
	children,
	value,
}: {
	children: JSX.Element | JSX.Element[] | any;
	value: LockScreenData;
}) => {
	return (
		<LockScreenContext.Provider value={value}>
			{children}
		</LockScreenContext.Provider>
	);
};