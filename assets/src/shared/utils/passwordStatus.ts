import { __ } from '@wordpress/i18n';
import { applyFilters } from '@wordpress/hooks';
import type { FinalPasswordEntry } from '@shared/types';

export type StatusCode =
	| 'INCOMPLETE'
	| 'INACTIVE'
	| 'ACTIVE'
	| 'NO_PASSWORDS'
	| 'NO_ACTIVE_PASSWORDS'
	| string;

export interface PasswordStats {
	isAllPasswords: boolean;
	hasAssignedPasswords: boolean;
	arePasswordsValid: boolean;
	[key: string]: any;
}

export const analyzePasswords = (
	selectedPasswordIds: (string | number)[],
	globalPasswords: FinalPasswordEntry[]
): PasswordStats => {
	const safeIds = selectedPasswordIds.map(String);
	const isAllPasswords = safeIds.includes('all');

	const matchedPasswords = globalPasswords.filter((p) =>
		safeIds.includes(String(p.id))
	);

	const activeMatched = matchedPasswords.filter((p) => p.is_active);

	const hasAssignedPasswords = isAllPasswords
		? globalPasswords.length > 0
		: matchedPasswords.length > 0;

	const arePasswordsValid = isAllPasswords
		? globalPasswords.some((p) => p.is_active)
		: activeMatched.length > 0;

	const baseStats: PasswordStats = {
		isAllPasswords,
		hasAssignedPasswords,
		arePasswordsValid,
	};

	return applyFilters(
		'ppadvp.analyze_passwords',
		baseStats,
		activeMatched
	) as PasswordStats;
};

export const getProtectionStatusUI = (
	isActive: boolean,
	isValidConfig: boolean,
	stats: PasswordStats,
	context: 'rule' | 'sidebar' | 'password' = 'rule',
	hasFieldErrors: boolean = false
) => {
	const determineStatusCode = (): StatusCode => {
		if (!isValidConfig) return 'INCOMPLETE';
		if (!isActive) return 'INACTIVE';

		if (!stats.hasAssignedPasswords) return 'NO_PASSWORDS';
		if (!stats.arePasswordsValid) return 'NO_ACTIVE_PASSWORDS';

		return 'ACTIVE';
	};

	const statusCode = applyFilters(
		'ppadvp.protection_status_code',
		determineStatusCode(),
		stats
	) as StatusCode;

	const labels: Record<string, Record<string, string>> = {
		rule: {
			INCOMPLETE: __('Incomplete', 'primeplaced-advanced-password-protection'),
			INACTIVE: __('Inactive', 'primeplaced-advanced-password-protection'),
			ACTIVE: __('Active', 'primeplaced-advanced-password-protection'),
			NO_PASSWORDS: __('No passwords', 'primeplaced-advanced-password-protection'),
			NO_ACTIVE_PASSWORDS: __(
				'No active passwords',
				'primeplaced-advanced-password-protection'
			),
		},
		password: {
			INACTIVE: __('Inactive', 'primeplaced-advanced-password-protection'),
			ACTIVE: __('Active', 'primeplaced-advanced-password-protection'),
		},
		sidebar: {
			INCOMPLETE: __(
				'Requires you to assign access passwords.',
				'primeplaced-advanced-password-protection'
			),
			INACTIVE: __(
				'The content is publicly available.',
				'primeplaced-advanced-password-protection'
			),
			ACTIVE: __(
				'Content protected with selected passwords.',
				'primeplaced-advanced-password-protection'
			),
			NO_PASSWORDS: __(
				'No security passwords assigned.',
				'primeplaced-advanced-password-protection'
			),
			NO_ACTIVE_PASSWORDS: __(
				'The selected passwords are currently inactive.',
				'primeplaced-advanced-password-protection'
			),
		},
	};

	const classNames: Record<string, string> = {
		INCOMPLETE: 'is-gray',
		INACTIVE: 'is-gray',
		ACTIVE: 'is-green',
		NO_PASSWORDS: 'is-red',
		NO_ACTIVE_PASSWORDS: 'is-red',
	};

	const extendedLabels = applyFilters(
		'ppadvp.protection_status_labels',
		labels
	) as typeof labels;
	const extendedClassNames = applyFilters(
		'ppadvp.protection_status_classnames',
		classNames
	) as typeof classNames;

	return {
		config: {
			code: statusCode,
			label: extendedLabels[context]?.[statusCode] || statusCode,
			className: extendedClassNames[statusCode] || 'is-gray',
		},
		hasAnyError:
			hasFieldErrors ||
			statusCode === 'NO_PASSWORDS' ||
			statusCode === 'NO_ACTIVE_PASSWORDS',
	};
};
