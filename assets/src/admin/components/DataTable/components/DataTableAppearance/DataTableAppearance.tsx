import { __ } from '@wordpress/i18n';
import {
	Button,
	// eslint-disable-next-line @wordpress/no-unsafe-wp-apis
	__experimentalToggleGroupControl as ToggleGroupControl,
	// eslint-disable-next-line @wordpress/no-unsafe-wp-apis
	__experimentalToggleGroupControlOptionIcon as ToggleGroupControlOptionIcon,
	// eslint-disable-next-line @wordpress/no-unsafe-wp-apis
	__experimentalToggleGroupControlOption as ToggleGroupControlOption,
	SelectControl,
	Dropdown,
	MenuGroup,
	MenuItem,
} from '@wordpress/components';
import { arrowUp, arrowDown, check, cog } from '@wordpress/icons';
import type { DropdownRenderProps } from '@shared/types/wordpress-components';
import { useDataTableContext } from '../../DataTableContext';

import './DataTableAppearance.scss';

export const DataTableAppearance = () => {
	const {
		totalItems,
		columns,
		columnOrder,
		hiddenColumns,
		handleToggleColumn,
		sortBy,
		sortDirection,
		handleSort,
		perPage,
		perPageOptions,
		handlePerPageChange,
	} = useDataTableContext();

	const orderedColumns = columnOrder
		.map((id) => columns.find((c) => c.id === id)!)
		.filter((c) => c && !c.isActionColumn);

	const sortableColumnsOptions = columns
		.filter((c) => c.sortable)
		.map((c) => ({
			label: c.header as string,
			value: c.id,
		}));

	return (
		<Dropdown
			popoverProps={{
				placement: 'bottom-end',
			}}
			className="ppadvp-datatable__appearance-dropdown"
			renderToggle={({
				isOpen,
				onToggle,
			}: DropdownRenderProps) => (
				<Button
					icon={cog}
					onClick={onToggle}
					aria-expanded={isOpen}
					variant="tertiary"
					className="ppadvp-button"
					label={__('Settings', 'primeplaced-advanced-password-protection')}
				/>
			)}
			renderContent={() => (
				<div className="ppadvp-datatable__appearance-dropdown-content">
					<h3 className="ppadvp-datatable__appearance-title">
						{__('Appearance', 'primeplaced-advanced-password-protection')}
					</h3>

					{sortableColumnsOptions.length > 0 && handleSort && (
						<div className="ppadvp-datatable__appearance-row ppadvp-datatable__appearance-row--columns">
							<SelectControl
								label={__(
									'Sort by',
									'primeplaced-advanced-password-protection'
								)}
								value={sortBy}
								options={sortableColumnsOptions}
								onChange={(val: string) =>
									handleSort(val, sortDirection || 'desc')
								}
								
								__next40pxDefaultSize
							/>
							<ToggleGroupControl
								label={__(
									'Order',
									'primeplaced-advanced-password-protection'
								)}
								value={sortDirection}
								onChange={(
									newDirection:
										| string
										| number
										| undefined
								) =>
									handleSort(
										sortBy || '',
										newDirection as 'asc' | 'desc'
									)
								}
								isBlock
								className="ppadvp-datatable__appearance-select"
								__next40pxDefaultSize
							>
								<ToggleGroupControlOptionIcon
									value="asc"
									icon={arrowUp}
									label={__(
										'Ascending',
										'primeplaced-advanced-password-protection'
									)}
								/>
								<ToggleGroupControlOptionIcon
									value="desc"
									icon={arrowDown}
									label={__(
										'Descending',
										'primeplaced-advanced-password-protection'
									)}
								/>
							</ToggleGroupControl>
						</div>
					)}

					{handlePerPageChange &&
						perPage &&
						perPageOptions.length > 1 && (
							<div className="ppadvp-datatable__appearance-row">
								<ToggleGroupControl
									label={__(
										'Items per page',
										'primeplaced-advanced-password-protection'
									)}
									value={perPage?.toString()}
									onChange={(
										val: string | number | undefined
									) =>
										handlePerPageChange(Number(val))
									}
									isBlock
									className="ppadvp-datatable__appearance-select"
									__next40pxDefaultSize
								>
									{perPageOptions.map((opt) => (
										<ToggleGroupControlOption
											key={opt}
											value={opt.toString()}
											label={opt.toString()}
										/>
									))}
								</ToggleGroupControl>
							</div>
						)}

					{handleToggleColumn && (
						<div className="ppadvp-datatable__appearance-row">
							<MenuGroup
								label={__(
									'Properties',
									'primeplaced-advanced-password-protection'
								)}
							>
								{orderedColumns.map((col) => {
									if (col.isFixed) {
										return null;
									}
									const isVisible = !hiddenColumns.includes(
										col.id
									);
									return (
										<MenuItem
											key={col.id}
											icon={isVisible ? check : undefined}
											onClick={() =>
												handleToggleColumn(col.id)
											}
										>
											{col.header}
										</MenuItem>
									);
								})}
							</MenuGroup>
						</div>
					)}
				</div>
			)}
		/>
	);
};
