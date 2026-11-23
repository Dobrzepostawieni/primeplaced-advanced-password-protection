import { __ } from '@wordpress/i18n';
import { Animate, Icon } from '@wordpress/components';
import { check, closeSmall } from '@wordpress/icons';
import { useSettingsState } from '@shared/contexts';
import { cn } from '@shared/utils/formatting';

export const LockStatusStat = (): JSX.Element => {
	const { isLoading, isLockEnabled } = useSettingsState();

	const getTrendClass = () => {
		if (isLoading) {
			return 'is-loading';
		}
		return isLockEnabled ? 'is-enabled' : 'is-disabled';
	};

	const getTrendText = () => {
		if (isLoading) {
			return __( 'Loading…', 'primeplaced-advanced-password-protection');
		}
		return isLockEnabled
			? __( 'Active', 'primeplaced-advanced-password-protection')
			: __( 'Inactive', 'primeplaced-advanced-password-protection');
	};

	return (
		<div className="ppadvp-stats-card">
			<span className="ppadvp-stats-card-title">
				{__( 'Lockdown status', 'primeplaced-advanced-password-protection')}
			</span>
			{isLoading ? (
				<div className="ppadvp-stats-card-spinner">
					<div className="ppadvp-spinner" />
				</div>
			) : (
				<Animate
					key={String(isLockEnabled)}
					type="slide-in"
					options={{ origin: 'right' }}
				>
					{({ className }) => (
						<Icon
							icon={isLockEnabled ? check : closeSmall}
							className={cn(
								'ppadvp-stats-card-icon',
								className,
								isLockEnabled ? 'is-enabled' : 'is-disabled'
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
