import { __ } from '@wordpress/i18n';
import { MenuGroup, MenuItem } from '@wordpress/components';
import { arrowLeft, arrowRight, unseen, check, funnel } from '@wordpress/icons';
import type { ColumnDef } from '../../types';
import { useDataTableContext } from '../../DataTableContext';

interface ColumnDropdownMenuProps<T> {
	column: ColumnDef<T>;
	columnIndex: number;
	closeDropdown: () => void;
}

export const ColumnDropdownMenu = <T,>({
	column,
	columnIndex,
	closeDropdown,
}: ColumnDropdownMenuProps<T>) => {
	const {
		visibleColumns,
		sortBy,
		sortDirection,
		handleSort,
		handleMoveLeft,
		handleMoveRight,
		handleToggleColumn,
		filters,
		visibleFilters,
		handleShowFilter,
	} = useDataTableContext<T>();

	const isFixedLeft = column.isFixed === 'left';
	const isFixedRight = column.isFixed === 'right';

	const isFirstMovableColumn =
		columnIndex === (visibleColumns[0]?.isFixed === 'left' ? 1 : 0);
	const isLastMovableColumn =
		columnIndex ===
		visibleColumns.length -
			(visibleColumns[visibleColumns.length - 1]?.isFixed === 'right'
				? 2
				: 1);

	const columnFilterDefinition = filters?.find(
		(filterItem) => filterItem.id === column.id
	);
	const isFilterAlreadyActive = visibleFilters?.includes(column.id);

	return (
		<div className="ppadvp-datatable__head-dropdown-content">
			{column.sortable && handleSort && (
				<MenuGroup>
					<MenuItem
						icon={
							sortBy === column.id && sortDirection === 'asc'
								? check
								: undefined
						}
						onClick={() => {
							handleSort(column.id, 'asc');
							closeDropdown();
						}}
					>
						{__( 'Sort ascending', 'primeplaced-advanced-password-protection')}
					</MenuItem>
					<MenuItem
						icon={
							sortBy === column.id && sortDirection === 'desc'
								? check
								: undefined
						}
						onClick={() => {
							handleSort(column.id, 'desc');
							closeDropdown();
						}}
					>
						{__( 'Sort descending', 'primeplaced-advanced-password-protection')}
					</MenuItem>
				</MenuGroup>
			)}

			{columnFilterDefinition && handleShowFilter && (
				<MenuGroup>
					<MenuItem
						icon={funnel}
						disabled={isFilterAlreadyActive}
						onClick={() => {
							handleShowFilter(column.id);
							closeDropdown();
						}}
					>
						{__( 'Filter', 'primeplaced-advanced-password-protection')}
					</MenuItem>
				</MenuGroup>
			)}

			<MenuGroup>
				<MenuItem
					icon={arrowLeft}
					disabled={
						isFixedLeft || isFixedRight || isFirstMovableColumn
					}
					onClick={() => {
						handleMoveLeft(column.id);
						closeDropdown();
					}}
				>
					{__( 'Move left', 'primeplaced-advanced-password-protection')}
				</MenuItem>
				<MenuItem
					icon={arrowRight}
					disabled={
						isFixedLeft || isFixedRight || isLastMovableColumn
					}
					onClick={() => {
						handleMoveRight(column.id);
						closeDropdown();
					}}
				>
					{__( 'Move right', 'primeplaced-advanced-password-protection')}
				</MenuItem>
				{handleToggleColumn && !isFixedLeft && !isFixedRight && (
					<MenuItem
						icon={unseen}
						onClick={() => {
							handleToggleColumn(column.id);
							closeDropdown();
						}}
					>
						{__( 'Hide column', 'primeplaced-advanced-password-protection')}
					</MenuItem>
				)}
			</MenuGroup>
		</div>
	);
};
