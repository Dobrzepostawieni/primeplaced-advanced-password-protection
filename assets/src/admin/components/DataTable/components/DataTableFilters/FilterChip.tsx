import { useEffect, useRef } from '@wordpress/element';
import { Dropdown, Button } from '@wordpress/components';
import { closeSmall } from '@wordpress/icons';
import { cn } from '@shared/utils/formatting';
import type { DropdownRenderProps } from '@shared/types/wordpress-components';
import type { FilterOperator, FilterDef } from '../../types';
import { FilterDropdownContent } from './FilterDropdownContent';

interface FilterChipProps {
	filterId: string;
	filterDef: FilterDef;
	activeFilter: any;
	operatorLabel: string;
	valueLabel: string | null;
	onHide: () => void;
	onFilterChange: (id: string, val: any, op: FilterOperator) => void;
	autoOpen: boolean;
	onAutoOpenDone: () => void;
}

export const FilterChip = ({
	filterId,
	filterDef,
	activeFilter,
	operatorLabel,
	valueLabel,
	onHide,
	onFilterChange,
	autoOpen,
	onAutoOpenDone,
}: FilterChipProps) => {
	const triggerRef = useRef<HTMLSpanElement>(null);

	useEffect(() => {
		if (autoOpen && triggerRef.current) {
			triggerRef.current.click();
			onAutoOpenDone();
		}
	}, [autoOpen, onAutoOpenDone]);

	const handleKeyDown = (e: React.KeyboardEvent<HTMLSpanElement>) => {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			triggerRef.current?.click();
		}
	};

	return (
		<Dropdown
			popoverProps={{ placement: 'bottom-start' }}
			renderToggle={({
				isOpen,
				onToggle,
			}: DropdownRenderProps) => (
				<div
					className={cn(
						'ppadvp-datatable__active-filter-chip',
						isOpen && 'is-open'
					)}
				>
					<span
						ref={triggerRef}
						className="ppadvp-datatable__active-filter-label"
						onClick={onToggle}
						onKeyDown={handleKeyDown}
						role="button"
						tabIndex={0}
					>
						{filterDef.label}
						{valueLabel ? (
							<>
								<span>({operatorLabel.toLowerCase()})</span>:{' '}
								<strong>{valueLabel}</strong>
							</>
						) : null}
					</span>

					<Button
						icon={closeSmall}
						variant="tertiary"
						isDestructive
						size="compact"
						onClick={onHide}
						className="ppadvp-button ppadvp-datatable__active-filter-remove"
					/>
				</div>
			)}
			renderContent={({ onClose }: DropdownRenderProps) => (
				<FilterDropdownContent
					filterId={filterId}
					filterDef={filterDef}
					activeFilter={activeFilter}
					onFilterChange={onFilterChange}
					onClose={onClose}
				/>
			)}
		/>
	);
};
