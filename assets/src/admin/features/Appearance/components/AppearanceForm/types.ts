import type { DesignSettings } from '@shared/types/entities';

export interface ValidationErrors {
	btnLabel?: string;
	errorMsg?: string;
	[key: string]: string | null | undefined;
}

export interface AppearanceUiComponentProps {
	settings: DesignSettings;
	defaults: Partial<DesignSettings>;
	updateSetting: <K extends keyof DesignSettings>(
		key: K,
		value: DesignSettings[K]
	) => void;

	isLoading?: boolean;
}

export interface AppearanceUiComponentWithErrorsProps
	extends AppearanceUiComponentProps {
	errors: ValidationErrors;
}

export interface ColorControlProps {
	label: string;
	value: string | undefined;
	onChange: (color: string) => void;
	defaultValue?: string;
	hasBadContrastText?: string;
	hasBadContrast?: boolean;
}

export interface PpadvpTextControlProps {
	label: string;
	value: string | undefined | null;
	defaultValue?: string;
	onChange: (value: string) => void;
	help?: string | null;
	status?: 'error' | 'success' | 'warning' | undefined;
	hasError?: boolean;
	className?: string;
}
