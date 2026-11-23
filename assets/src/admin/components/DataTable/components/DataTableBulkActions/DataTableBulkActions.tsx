import { __, sprintf } from '@wordpress/i18n';
import {
	CheckboxControl,
	Button,
	// eslint-disable-next-line @wordpress/no-unsafe-wp-apis
	__experimentalHStack as HStack,
} from '@wordpress/components';
import { useInstanceId } from '@wordpress/compose';
import { close } from '@wordpress/icons';
import { useDataTableContext } from '../../DataTableContext';

import './DataTableBulkActions.scss';

export const DataTableBulkActions = () => {
	const {
		selectedRowIds,
		boundBulkActions,
		clearSelection,
		currentPage,
		totalItems,
		perPage,
		selectable,
		isAllCurrentPageSelected,
		isIndeterminate,
		handleSelectAllTrigger,
	} = useDataTableContext();

	const isBulkMode = selectedRowIds.length > 0;
	const currentCount = Math.min(
		perPage,
		totalItems - (currentPage - 1) * perPage
	);

	const checkboxId = useInstanceId(
		DataTableBulkActions,
		'ppadvp-datatable-bulk-checkbox'
	) as string;

	return (
		<div className="ppadvp-datatable__footer-bulkactions">
			{selectable && (
				<>
					<CheckboxControl
						id={checkboxId}
						checked={isAllCurrentPageSelected}
						// @ts-ignore
						indeterminate={isIndeterminate}
						onChange={handleSelectAllTrigger}
						
						className="ppadvp-datatable__bulk-checkbox ppadvp-checkbox-control"
					/>
					<label htmlFor={checkboxId} className="screen-reader-text">
						{__(
							'Select all on this page',
							'primeplaced-advanced-password-protection'
						)}
					</label>
				</>
			)}

			{!isBulkMode ? (
				<span>
					{totalItems > 0
						? sprintf(
								/* translators: 1: current visible count, 2: total items */
								__(
									'%1$d of %2$d elements ',
									'primeplaced-advanced-password-protection'
								),
								currentCount,
								totalItems
						  )
						: __('0 items', 'primeplaced-advanced-password-protection')}
				</span>
			) : (
				<HStack justify="flex-start" alignment="center" spacing={2}>
					<span className="ppadvp-datatable__bulk-count">
						{selectedRowIds.length}{' '}
						{__('selected ', 'primeplaced-advanced-password-protection')}
					</span>

					<div className="ppadvp-datatable__bulk-divider" />

					{boundBulkActions.map((action) => (
						<Button
							key={action.id}
							variant="secondary"
							isDestructive={action.isDestructive}
							icon={action.icon}
							onClick={action.onClick}
							className="ppadvp-button"
						>
							{action.label}
						</Button>
					))}

					<div className="ppadvp-datatable__bulk-spacer" />

					<Button
						icon={close}
						variant="tertiary"
						onClick={clearSelection}
						aria-label={__(
							'Clear ',
							'primeplaced-advanced-password-protection'
						)}
						className="ppadvp-button"
					/>
				</HStack>
			)}
		</div>
	);
};
