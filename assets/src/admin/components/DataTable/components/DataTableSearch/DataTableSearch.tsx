import { useState, useEffect } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import {
	SearchControl,
	Dropdown,
	Button,
	MenuGroup,
	MenuItem,
} from '@wordpress/components';
import { funnel } from '@wordpress/icons';
import { cn } from '@shared/utils/formatting';
import type { DropdownRenderProps } from '@shared/types/wordpress-components';
import { useDataTableContext } from '../../DataTableContext';
import './DataTableSearch.scss';

export const DataTableSearch = () => {
	const {
		searchQuery,
		handleSearchChange,
		filters,
		visibleFilters,
		handleShowFilter,
		isFiltersPanelVisible,
		setIsFiltersPanelVisible,
	} = useDataTableContext();

	const [localQuery, setLocalQuery] = useState(searchQuery || '');

	useEffect(() => {
		const timer = setTimeout(() => {
			if (localQuery !== searchQuery) {
				handleSearchChange(localQuery);
			}
		}, 300);

		return () => clearTimeout(timer);
	}, [localQuery, handleSearchChange, searchQuery]);

	useEffect(() => {
		if (searchQuery === '') {
			setLocalQuery('');
		}
	}, [searchQuery]);

	if (!handleSearchChange) {
		return null;
	}

	const hasActiveFilters = visibleFilters && visibleFilters.length > 0;

	return (
		<>
			<SearchControl
				value={localQuery}
				onChange={setLocalQuery}
				placeholder={__('Search', 'primeplaced-advanced-password-protection')}
				size="compact"
				className="ppadvp-datatable-search-control"
				__nextHasNoMarginBottom
			/>

			{filters && filters.length > 0 && (
				<>
					{!hasActiveFilters && (
						<Dropdown
							popoverProps={{ placement: 'bottom-end' }}
							renderToggle={({
								isOpen,
								onToggle,
							}: DropdownRenderProps) => (
								<Button
									icon={funnel}
									onClick={onToggle}
									aria-expanded={isOpen}
									variant="tertiary"
									label={__(
										'Add filter',
										'primeplaced-advanced-password-protection'
									)}
									className="ppadvp-button ppadvp-datatable-search-button"
								/>
							)}
							renderContent={({
								onClose,
							}: DropdownRenderProps) => (
								<MenuGroup>
									{filters.map((f) => (
										<MenuItem
											key={f.id}
											onClick={() => {
												handleShowFilter(f.id);
												onClose();
											}}
										>
											{f.label}
										</MenuItem>
									))}
								</MenuGroup>
							)}
						/>
					)}
					{hasActiveFilters && (
						<Button
							icon={funnel}
							onClick={() =>
								setIsFiltersPanelVisible((prev) => !prev)
							}
							variant="tertiary"
							className={cn(
								'ppadvp-button ppadvp-datatable-search-button',
								isFiltersPanelVisible && 'is-active'
							)}
							aria-label={__(
								'Show/hide filters',
								'primeplaced-advanced-password-protection'
							)}
						>
							<span className="ppadvp-datatable-search-button-number">
								{visibleFilters.length}
							</span>
						</Button>
					)}
				</>
			)}
		</>
	);
};
