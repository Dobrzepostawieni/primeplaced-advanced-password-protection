/**
 * Cookies Logic Hook.
 *
 * @package
 */

import { useState, useCallback } from '@wordpress/element';
import { useSettingsStateContext, useSettingsDispatch } from '@shared/contexts';
import { useNotices } from '@shared/components/Notices';
import { generateUuid } from '@shared/utils';
import type { CookiesTypes } from '@shared/types/entities';

export const useCookies = () => {
	const { settings, isSaving } = useSettingsStateContext();
	const { updateSettings, saveSettings } = useSettingsDispatch();
	const { notify } = useNotices();

	const [isConfirmOpen, setIsConfirmOpen] = useState(false);
	const openConfirmModal = () => setIsConfirmOpen(true);
	const closeConfirmModal = () => setIsConfirmOpen(false);

	const cookieType = settings?.cookie_type || 'duration';
	const cookieDays = settings?.cookie_days ?? 7;

	const handleTypeChange = useCallback(
		(newType: string | number | undefined) => {
			if (newType === undefined) {
				return;
			}
			const type = newType as CookiesTypes;
			updateSettings({ cookie_type: type });
			void saveSettings({ cookie_type: type });
		},
		[updateSettings, saveSettings]
	);

	const handleDaysChange = useCallback(
		(newVal: string | number) => {
			if (newVal === '') {
				updateSettings({ cookie_days: '' as unknown as number });
				return;
			}
			const days =
				typeof newVal === 'string' ? parseInt(newVal, 10) : newVal;
			if (!isNaN(days) && days > 0) {
				updateSettings({ cookie_days: days });
			}
		},
		[updateSettings]
	);

	const handlePresetChange = useCallback(
		(days: number) => {
			updateSettings({ cookie_days: days });
			void saveSettings({ cookie_days: days }, false);
		},
		[updateSettings, saveSettings]
	);

	const handleDaysBlur = useCallback(() => {
		let days = Number(settings?.cookie_days);
		if (!days || days < 1 || isNaN(days)) {
			days = 7;
		}
		updateSettings({ cookie_days: days });
		void saveSettings({ cookie_days: days }, false);
	}, [settings?.cookie_days, updateSettings, saveSettings]);

	const handleForceLogout = useCallback(async () => {
		const newSalt = generateUuid().replace(/-/g, '');
		
		const success = await saveSettings(
			{ 
				session_salt: newSalt
			},
			'COOKIES_USERS_LOGOUT'
		);

		if (success) {
			setIsConfirmOpen(false);
		} else {
			notify('COOKIES_ERROR');
		}
	}, [saveSettings, notify]);

	return {
		cookieType,
		cookieDays,
		isConfirmOpen,
		isSaving,
		openConfirmModal,
		closeConfirmModal,
		handleTypeChange,
		handleDaysChange,
		handlePresetChange,
		handleDaysBlur,
		handleForceLogout,
	};
};
