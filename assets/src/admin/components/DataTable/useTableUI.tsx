import { useState, useEffect, useMemo } from '@wordpress/element';
import { Dropdown, Button, MenuGroup, MenuItem } from '@wordpress/components';
import { moreVertical } from '@wordpress/icons';
import { __ } from '@wordpress/i18n';
import type { ColumnDef, BoundBulkAction, UseTableUIProps } from './types';
import { useMediaQuery } from '@shared/hooks/useMediaQuery';
import type { DropdownRenderProps } from '@shared/types/wordpress-components';

export const useTableUI = <T,>({
	initialColumns,
	actions = [],
	bulkActions = [],
	data,
	keyExtractor,
	selectedRowIds,
	onSelectAll,
	hiddenColumns,
	clearSelection,
}: UseTableUIProps<T> & { clearSelection: () => void }) => {
	const isMobile = useMediaQuery('(max-width: 782px)');

	const columns = useMemo(() => {
		if (actions.length > 0) {
			const hasActionsColumn = initialColumns.some(
				(c) => c.id === 'actions'
			);

			if (!hasActionsColumn) {
				return [
					...initialColumns,
					{
						id: 'actions',
						header: __('Actions', 'primeplaced-advanced-password-protection'),
						isFixed: 'right',
						isActionColumn: true,
						cell: (row: T) => {
							const primaryActions = actions.filter(
								(action) => action.isPrimary
							);
							const secondaryActions = actions.filter(
								(action) => !action.isPrimary
							);

							if (isMobile) {
								return (
									<Dropdown
										popoverProps={{
											placement: 'bottom-end',
										}}
										renderToggle={({
											isOpen,
											onToggle,
										}: DropdownRenderProps) => (
											<Button
												icon={moreVertical}
												onClick={onToggle}
												aria-expanded={isOpen}
												variant="tertiary"
												className="ppadvp-button"
											/>
										)}
										renderContent={({
											onClose,
										}: DropdownRenderProps) => (
											<div className="ppadvp-datatable__action-dropdown-content">
												<MenuGroup className="ppadvp-datatable__action-dropdown-group">
													{actions.map((action) => (
														<MenuItem
															key={action.id}
															icon={action.icon}
															isDestructive={
																action.isDestructive
															}
															disabled={
																action.isDisabled &&
																action.isDisabled(
																	row
																)
															}
															onClick={() => {
																action.onClick(
																	row,
																	clearSelection
																);
																onClose();
															}}
															className="ppadvp-button is-tertiary"
														>
															{action.label}
														</MenuItem>
													))}
												</MenuGroup>
											</div>
										)}
									/>
								);
							}

							return (
								<>
									{primaryActions.map((action) => (
										<span
											className="ppadvp-datatable__action-primary"
											key={action.id}
										>
											<Button
												variant="tertiary"
												size="compact"
												icon={action.icon}
												disabled={
													action.isDisabled &&
													action.isDisabled(row)
												}
												isDestructive={
													action.isDestructive
												}
												onClick={() => {
													action.onClick(
														row,
														clearSelection
													);
												}}
												className="ppadvp-button"
											>
												{action.label}
											</Button>
										</span>
									))}
									{secondaryActions.length > 0 && (
										<Dropdown
											popoverProps={{
												placement: 'bottom-end',
											}}
											renderToggle={({
												isOpen,
												onToggle,
											}: DropdownRenderProps) => (
												<Button
													icon={moreVertical}
													onClick={onToggle}
													aria-expanded={isOpen}
													variant="tertiary"
													className="ppadvp-button"
												/>
											)}
											renderContent={({
												onClose,
											}: DropdownRenderProps) => (
												<div className="ppadvp-datatable__action-dropdown-content">
													<MenuGroup className="ppadvp-datatable__action-dropdown-group">
														{secondaryActions.map(
															(action) => (
																<MenuItem
																	key={
																		action.id
																	}
																	icon={
																		action.icon
																	}
																	isDestructive={
																		action.isDestructive
																	}
																	disabled={
																		action.isDisabled &&
																		action.isDisabled(
																			row
																		)
																	}
																	onClick={() => {
																		action.onClick(
																			row,
																			clearSelection
																		);
																		onClose();
																	}}
																	className="ppadvp-button is-tertiary"
																>
																	{
																		action.label
																	}
																</MenuItem>
															)
														)}
													</MenuGroup>
												</div>
											)}
										/>
									)}
								</>
							);
						},
					} as ColumnDef<T>,
				];
			}
		}
		return initialColumns;
	}, [initialColumns, actions, clearSelection, isMobile]);

	const [columnOrder, setColumnOrder] = useState<string[]>(
		columns.map((c) => c.id)
	);

	useEffect(() => {
		const newIds = columns.map((c) => c.id);
		if (
			newIds.length !== columnOrder.length ||
			!newIds.every((id) => columnOrder.includes(id))
		) {
			setColumnOrder(newIds);
		}
	}, [columns, columnOrder]);

	const handleMoveLeft = (id: string) => {
		const idx = columnOrder.indexOf(id);
		if (idx > 0) {
			const prevCol = columns.find((c) => c.id === columnOrder[idx - 1]);
			if (prevCol?.isFixed === 'left') return;

			const newOrder = [...columnOrder];
			[newOrder[idx - 1], newOrder[idx]] = [
				newOrder[idx],
				newOrder[idx - 1],
			];
			setColumnOrder(newOrder);
		}
	};

	const handleMoveRight = (id: string) => {
		const idx = columnOrder.indexOf(id);
		if (idx < columnOrder.length - 1) {
			const nextCol = columns.find((c) => c.id === columnOrder[idx + 1]);
			if (nextCol?.isFixed === 'right') return;

			const newOrder = [...columnOrder];
			[newOrder[idx], newOrder[idx + 1]] = [
				newOrder[idx + 1],
				newOrder[idx],
			];
			setColumnOrder(newOrder);
		}
	};

	const visibleColumns = columnOrder
		.map((id) => columns.find((c) => c.id === id))
		.filter(
			(c): c is ColumnDef<T> =>
				c !== undefined && !hiddenColumns.includes(c.id)
		);

	const currentPageIds = data.map((row, index) => keyExtractor(row, index));
	const isAllCurrentPageSelected =
		currentPageIds.length > 0 &&
		currentPageIds.every((id) => selectedRowIds.includes(id));
	const isSomeCurrentPageSelected = currentPageIds.some((id) =>
		selectedRowIds.includes(id)
	);
	const isIndeterminate =
		isSomeCurrentPageSelected && !isAllCurrentPageSelected;

	const handleSelectAllTrigger = (val: boolean) => {
		if (onSelectAll) {
			onSelectAll(!isAllCurrentPageSelected, currentPageIds);
		}
	};

	const boundBulkActions = useMemo<BoundBulkAction[]>(() => {
		const explicitBulk = (bulkActions || []).map((action) => ({
			...action,
			onClick: () => action.onClick(selectedRowIds, clearSelection),
		}));

		const implicitBulk = actions
			.filter((a) => a.supportsBulk)
			.map((a) => ({
				id: `bulk-${a.id}`,
				label: a.label,
				icon: a.icon,
				isDestructive: a.isDestructive,
				onClick: () => a.onClick(selectedRowIds, clearSelection),
			}));

		return [...explicitBulk, ...implicitBulk];
	}, [bulkActions, actions, selectedRowIds, clearSelection]);

	return {
		columns,
		columnOrder,
		visibleColumns,
		handleMoveLeft,
		handleMoveRight,
		isAllCurrentPageSelected,
		isIndeterminate,
		handleSelectAllTrigger,
		boundBulkActions,
	};
};
