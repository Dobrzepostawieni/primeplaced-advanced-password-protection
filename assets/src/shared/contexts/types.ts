import type { AppSettings, PpadvpData, FinalPasswordEntry } from '@shared/types';
import type { NoticeKey } from '@shared/components/Notices';

type DistributiveOmit<T, K extends keyof any> = T extends any
	? Omit<T, K>
	: never;

export type PasswordUpdateEntry = Omit<FinalPasswordEntry, 'password'> & {
	password?: string;
};

export type SettingsUpdatePayload = Partial<
	DistributiveOmit<AppSettings, 'password'>
> & {
	password?: PasswordUpdateEntry | null;
};

export interface SettingsStateValue {
	ppadvpData: PpadvpData;
	settings: AppSettings | null;
	isLoading: boolean;
	isSaving: boolean;
	isDirty: boolean;
	proLoaded: boolean;
}

export interface SettingsDispatchValue {
	updateSettings: (partial: SettingsUpdatePayload) => void;
	saveSettings: (
		newData: SettingsUpdatePayload,
		notice?: NoticeKey | false
	) => Promise<boolean>;
	refetch: () => Promise<void>;
	discard: () => void;
}
