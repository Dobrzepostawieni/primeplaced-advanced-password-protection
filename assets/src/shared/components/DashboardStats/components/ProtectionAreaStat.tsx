import { __ } from '@wordpress/i18n';
import { Animate } from '@wordpress/components';
import { cn } from '@shared/utils/formatting';
import { useSettingsState, useSettingsStateContext } from '@shared/contexts';

export const ProtectionAreaStat = (): JSX.Element => {
	const { isLoading, isLockEnabled } = useSettingsState();
	const { settings } = useSettingsStateContext();

	const protectionMode = (settings as any)?.protection_mode || 'global';

	const isSystemOff = !isLockEnabled;
	const isGlobalMode = protectionMode === 'global';

	const modeLabels: Record<string, string> = {
		global: __('Full page', 'primeplaced-advanced-password-protection'),
		selected_content: __(
			'Selected content',
			'primeplaced-advanced-password-protection'
		),
	};

	const getIconClass = () => {
		if (isSystemOff) {
			return 'dashicons-minus is-inactive';
		}
		if (isGlobalMode) {
			return 'dashicons-admin-site is-global';
		}
		return 'dashicons-networking is-selected';
	};

	const getTrendClass = () => {
		if (isSystemOff) {
			return 'is-inactive';
		}
		if (isGlobalMode) {
			return 'is-enabled';
		}
		return 'is-pro-mode';
	};

	const getTrendText = () => {
		if (isLoading) {
			return __('Loading…', 'primeplaced-advanced-password-protection');
		}
		if (isSystemOff) {
			return __('None', 'primeplaced-advanced-password-protection');
		}
		return modeLabels[protectionMode] || protectionMode;
	};

	return (
		<div className="ppadvp-stats-card">
			<span className="ppadvp-stats-card-title">
				{__('Area of protection', 'primeplaced-advanced-password-protection')}
			</span>
			{isLoading ? (
				<div className="ppadvp-stats-card-spinner">
					<div className="ppadvp-spinner" />
				</div>
			) : (
				<Animate
					key={`${isSystemOff}-${protectionMode}`}
					type="slide-in"
					options={{ origin: 'right' }}
				>
					{({ className }) => (
						<span
							className={cn(
								'dashicons',
								'ppadvp-stats-card-icon is-mode',
								className,
								getIconClass()
							)}
						/>
					)}
				</Animate>
			)}
			<span className={cn('ppadvp-stats-card-trend', getTrendClass())}>
				{getTrendText()}
			</span>
		</div>
	);
};
