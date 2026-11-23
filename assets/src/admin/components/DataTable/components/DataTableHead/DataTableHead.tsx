import { __ } from '@wordpress/i18n';
import { CheckboxControl } from '@wordpress/components';
import { useInstanceId } from '@wordpress/compose';
import { useDataTableContext } from '../../DataTableContext';
import { StandardColumnHeader } from './StandardColumnHeader';
import { useMediaQuery } from '@shared/hooks/useMediaQuery';
import './DataTableHead.scss';

export const DataTableHead = <T,>() => {
	const {
		selectable,
		isAllCurrentPageSelected,
		isIndeterminate,
		handleSelectAllTrigger,
		visibleColumns,
	} = useDataTableContext<T>();

	const checkboxId = useInstanceId(
		DataTableHead,
		'ppadvp-datatable-head-checkbox'
	) as string;

	const isMobile = useMediaQuery('(max-width: 782px)');

	const columnsToRender = isMobile
		? visibleColumns.filter((col) => !col.hideOnMobile)
		: visibleColumns.filter((col) => !col.hideOnDesktop);

	return (
		<thead>
			<tr className="ppadvp-datatable__head-row">
				{selectable && (
					<th scope="col" className="ppadvp-datatable__head-all">
						<CheckboxControl
							id={checkboxId}
							checked={isAllCurrentPageSelected}
							// @ts-ignore
							indeterminate={isIndeterminate}
							onChange={handleSelectAllTrigger}
							
							className="ppadvp-datatable__bulk-checkbox ppadvp-checkbox-control"
						/>
						<label
							htmlFor={checkboxId}
							className="screen-reader-text"
						>
							{__('Select all', 'primeplaced-advanced-password-protection')}
						</label>
					</th>
				)}
				{columnsToRender.map((column, idx) => {
					if (column.isActionColumn) {
						return (
							<th
								key={column.id}
								className="ppadvp-datatable__head-actions"
								scope="col"
							>
								<span>{column.header}</span>
							</th>
						);
					}

					return (
						<StandardColumnHeader
							key={column.id}
							column={column}
							idx={idx}
						/>
					);
				})}
			</tr>
		</thead>
	);
};
