/**
 * Custom hook to handle Appearance Settings state and logic.
 *
 * @package
 */
import { useCallback, useMemo } from '@wordpress/element';
import { useSelect } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { useSettingsStateContext, useSettingsDispatch } from '@shared/contexts';
import type { PpadvpAdminData, DesignSettings } from '@shared/types/entities';

export const useAppearance = () => {
	const { settings, isLoading, isSaving, isDirty, ppadvpData } =
		useSettingsStateContext();
	const { updateSettings, saveSettings } = useSettingsDispatch();

	const adminData = ppadvpData as PpadvpAdminData;

	const defaults = useMemo(
		() => adminData?.default_design_settings || ({} as DesignSettings),
		[adminData]
	);

	const designSettings = useMemo(
		() => ({
			...defaults,
			...(settings?.design_settings || {}),
		}),
		[settings?.design_settings, defaults]
	);

	const updateDesignSetting = useCallback(
		<K extends keyof DesignSettings>(key: K, value: DesignSettings[K]) => {
			updateSettings({
				design_settings: {
					...designSettings,
					[key]: value,
				},
			});
		},
		[designSettings, updateSettings]
	);

	const logoUrl = useSelect(
		(select) => {
			const rawId = designSettings?.logoId;
			if (!rawId) return null;
			const id = parseInt(String(rawId), 10);
			if (Number.isFinite(id) && id > 0) {
				const coreStore = select('core') as any;
				const media = coreStore.getEntityRecord(
					'postType',
					'attachment',
					id
				);
				return media?.source_url || null;
			}
			return null;
		},
		[designSettings?.logoId]
	);

	const errors: Record<string, string | null> = {
		btnLabel: !designSettings.btnLabel?.trim()
			? __('This field is required', 'primeplaced-advanced-password-protection')
			: null,
		errorMsg: !designSettings.errorMsg?.trim()
			? __('This field is required', 'primeplaced-advanced-password-protection')
			: null,
	};

	const isValid = !Object.values(errors).some((error) => error !== null);

	return {
		isLoading,
		isSaving,
		isDirty,
		handleSave: () =>
			saveSettings(
				{ design_settings: designSettings },
				'APPEARANCE_SAVE_SUCCESS'
			),
		logoUrl,
		settings: designSettings,
		cookieType: settings?.cookie_type,
		enableRememberMe: (settings as any)?.enable_remember_me !== false,
		defaults,
		updateSetting: updateDesignSetting,
		errors,
		isValid,
	};
};
