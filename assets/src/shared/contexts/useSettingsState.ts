/**
 * Settings State Hook.
 * Computes derived state from the raw settings object.
 *
 * @package
 */
import { useMemo } from '@wordpress/element';
import { applyFilters } from '@wordpress/hooks';
import { useSettingsStateContext } from './SettingsContext';
import type { FinalPasswordEntry } from '@shared/types';

export const useSettingsState = () => {
    const { settings, ppadvpData, isLoading, isSaving, isDirty } =
        useSettingsStateContext();

    const activePlan = ppadvpData.active_plan;
    const isPremium = ppadvpData.is_premium;

    const computedState = useMemo(() => {
        const isLockEnabled = settings?.protection ?? false;

        const rawSettings = settings as Record<string, any>;
        const password = rawSettings?.password;

        const passwordEntry =
            password && Object.keys(password).length > 0
                ? (password as FinalPasswordEntry)
                : null;

        let passwordEntries = passwordEntry ? [passwordEntry] : [];
        
        passwordEntries = applyFilters(
            'ppadvp.settings.password_entries',
            passwordEntries,
            settings
        ) as FinalPasswordEntry[];

        const activePasswordsCount = passwordEntries.filter(
            (p) => p.is_active
        ).length;

        return {
            activePlan,
            isPremium,
            isLockEnabled,
            passwordEntry,
            passwordEntries,
            activePasswordsCount,
            isLoading,
            isSaving,
            isDirty,
        };
    }, [settings, activePlan, isPremium]);

    return computedState;
};