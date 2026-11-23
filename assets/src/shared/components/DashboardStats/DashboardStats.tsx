/**
 * Dashboard Stats Component.
 *
 * @package
 */

import type { ReactNode } from 'react';
import { applyFilters } from '@wordpress/hooks';

import {
	LockStatusStat,
	ProtectionAreaStat,
} from './components';

import './DashboardStats.scss';

export const DashboardStats = (): JSX.Element => {
	return (
		<div className="ppadvp-stats-wrapper">
			<LockStatusStat />
			<ProtectionAreaStat />

			{applyFilters('ppadvp.ui.DashboardProStats', []) as ReactNode[]}
		</div>
	);
};
