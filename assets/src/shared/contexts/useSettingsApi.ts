/**
 * Settings API Hook.
 * Manages application settings state and communicates with the REST API.
 *
 * @package
 */
import {
	useState,
	useCallback,
	useEffect,
	useMemo,
	useRef,
} from '@wordpress/element';
import { useNotices, type NoticeKey } from '@shared/components/Notices';
import { useApi } from '@shared/api/useApi';
import type { AppSettings } from '@shared/types';
import type { SettingsUpdatePayload } from '@shared/contexts/types';
import { prepareSettingsUpdatePayload } from './prepareSettingsUpdatePayload';

/**
 *
 */
export function useSettingsApi() {
	const { notify } = useNotices();
	const { fetchApi, hasFatalError } = useApi();
	const [settings, setSettings] = useState<AppSettings | null>(null);
	const [originalSettings, setOriginalSettings] =
		useState<AppSettings | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [isSaving, setIsSaving] = useState(false);
	const isFetchingRef = useRef(false);

	const isDirty = useMemo(() => {
		if (!settings || !originalSettings) return false;
		return JSON.stringify(settings) !== JSON.stringify(originalSettings);
	}, [settings, originalSettings]);

	const isDirtyRef = useRef(isDirty);

	useEffect(() => {
		isDirtyRef.current = isDirty;
	}, [isDirty]);

	useEffect(() => {
		if (!isDirty) return;

		const handleBeforeUnload = (event: BeforeUnloadEvent) => {
			event.preventDefault();
			event.returnValue = '';
		};

		window.addEventListener('beforeunload', handleBeforeUnload);

		return () =>
			window.removeEventListener('beforeunload', handleBeforeUnload);
	}, [isDirty]);

	const fetchSettings = useCallback(
		async (silent: boolean = false) => {
			if (hasFatalError.current || isFetchingRef.current) return;
			isFetchingRef.current = true;
			if (!silent) setIsLoading(true);

			try {
				const fetchedData = await fetchApi<AppSettings>({
					path: `/ppadvp/v1/settings?t=${Date.now()}`,
				});

				const cleanData = structuredClone(fetchedData);
				setSettings(cleanData);
				setOriginalSettings(cleanData);
			} catch (error) {
				if (!hasFatalError.current && !silent) {
					notify('SETTINGS_FETCH_ERROR');
				}
			} finally {
				isFetchingRef.current = false;
				if (!silent) setIsLoading(false);
			}
		},
		[fetchApi, hasFatalError, notify]
	);

	const saveSettings = useCallback(
		async (
			newData: SettingsUpdatePayload,
			notice: NoticeKey | false = 'SETTINGS_SAVE_SUCCESS',
			silent: boolean = false
		) => {
			if (hasFatalError.current) return false;
			if (!silent) setIsSaving(true);

			try {
				const responseData = await fetchApi<AppSettings>({
					path: '/ppadvp/v1/settings',
					method: 'POST',
					data: prepareSettingsUpdatePayload(newData),
				});

				const cleanData = structuredClone(responseData);
				setSettings(cleanData);
				setOriginalSettings(cleanData);

				if (notice !== false && !silent) notify(notice);
				return true;
			} catch (error) {
				if (!hasFatalError.current && !silent) {
					notify('SETTINGS_SAVE_ERROR');
					void fetchSettings(true);
				}
				return false;
			} finally {
				if (!silent) setIsSaving(false);
			}
		},
		[fetchApi, hasFatalError, notify, fetchSettings]
	);

	useEffect(() => {
		let lastFetchTime = 0;
		const onFocus = () => {
			const now = Date.now();
			if (!isDirtyRef.current && now - lastFetchTime > 10000) {
				lastFetchTime = now;
				void fetchSettings(true);
			}
		};

		window.addEventListener('focus', onFocus);
		return () => window.removeEventListener('focus', onFocus);
	}, [fetchSettings]);

	useEffect(() => {
		void fetchSettings();
	}, [fetchSettings]);

	const updateLocal = useCallback((partial: SettingsUpdatePayload) => {
		setSettings((prev) =>
			prev ? ({ ...prev, ...partial } as AppSettings) : prev
		);
	}, []);

	const discard = useCallback(() => {
		if (originalSettings) {
			setSettings(structuredClone(originalSettings));
		} else {
			void fetchSettings();
		}
	}, [originalSettings, fetchSettings]);

	return {
		settings,
		isLoading,
		isSaving,
		isDirty,
		updateLocal,
		saveSettings,
		fetchSettings,
		discard,
	};
}
