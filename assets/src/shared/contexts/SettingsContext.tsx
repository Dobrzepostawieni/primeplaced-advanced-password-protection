import {
	createContext,
	useContext,
	useMemo,
	useEffect,
	useState,
} from '@wordpress/element';
import { applyFilters } from '@wordpress/hooks';
import { useSettingsApi } from '@shared/contexts/useSettingsApi';
import type { SettingsStateValue, SettingsDispatchValue } from './types';
import type { PpadvpData, AppSettings } from '@shared/types';
import { __ } from '@wordpress/i18n';

const STATE_KEY = 'PpadvpSettingsStateContext_v1';
const DISPATCH_KEY = 'PpadvpSettingsDispatchContext_v1';

if (!(window as any)[STATE_KEY]) {
	(window as any)[STATE_KEY] = createContext<SettingsStateValue | undefined>(undefined);
}
if (!(window as any)[DISPATCH_KEY]) {
	(window as any)[DISPATCH_KEY] = createContext<SettingsDispatchValue | undefined>(undefined);
}

export const SettingsStateContext = (window as any)[STATE_KEY];
export const SettingsDispatchContext = (window as any)[DISPATCH_KEY];

export const useSettingsStateContext = () => {
	const context = useContext(SettingsStateContext) as SettingsStateValue | undefined;
	if (!context)
		throw new Error(
			'useSettingsStateContext must be used within a SettingsProvider'
		);
	return context;
};

export const useSettingsDispatch = () => {
	const context = useContext(SettingsDispatchContext) as SettingsDispatchValue | undefined;
	if (!context)
		throw new Error(
			'useSettingsDispatch must be used within a SettingsProvider'
		);
	return context;
};

export const SettingsProvider = ({
	children,
}: {
	children: JSX.Element | JSX.Element[] | any;
}) => {
	const {
		settings,
		isLoading,
		isSaving,
		isDirty,
		updateLocal,
		saveSettings,
		fetchSettings,
		discard,
	} = useSettingsApi();

	const ppadvpData = window.ppadvpAdminData as unknown as PpadvpData;
	const [proLoaded, setProLoaded] = useState(false);

	useEffect(() => {
		const loadModules = async () => {
			const plan = ppadvpData.active_plan;
			const isPremium = ppadvpData.is_premium;

			if (isLoading && !settings) {
				return;
			}

			try {
				if (!isPremium || plan === 'free') {
					const { initializePlaceholdersLogic } = await import(
						/* webpackChunkName: "primeplaced-advanced-password-protection-admin-placeholders" */
						'../../pro/placeholders'
					);
					initializePlaceholdersLogic();
					setProLoaded(true);
				} else {
					const loadProLogic = applyFilters(
						'ppadvp.admin.load_pro',
						null
					) as ((plan: string) => Promise<void>) | null;

					if (loadProLogic) {
						await loadProLogic(plan);
					}
					setProLoaded(true);
				}
			} catch (error: any) {
				if (error?.name !== 'ChunkLoadError') {
					// eslint-disable-next-line no-console
					console.error('PPADVP: Failed to load modules', error);
				}
				setProLoaded(true); 
			}
		};

		void loadModules();
	}, [ppadvpData.active_plan, ppadvpData.is_premium, isLoading, !!settings]);

	const stateValue = useMemo<SettingsStateValue>(
		() => ({
			ppadvpData,
			settings: settings as unknown as AppSettings | null,
			isLoading,
			isSaving,
			isDirty,
			proLoaded,
		}),
		[ppadvpData, settings, isLoading, isSaving, isDirty, proLoaded]
	);

	const dispatchValue = useMemo<SettingsDispatchValue>(
		() => ({
			updateSettings: updateLocal,
			saveSettings,
			refetch: fetchSettings,
			discard,
		}),
		[updateLocal, saveSettings, fetchSettings, discard]
	);

	return (
		<SettingsDispatchContext.Provider value={dispatchValue}>
			<SettingsStateContext.Provider value={stateValue}>
				{children}
			</SettingsStateContext.Provider>
		</SettingsDispatchContext.Provider>
	);
};