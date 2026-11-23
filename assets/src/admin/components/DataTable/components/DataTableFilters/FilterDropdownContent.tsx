import { useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import {
	MenuGroup,
	MenuItem,
	TextControl,
	DatePicker,
	// eslint-disable-next-line @wordpress/no-unsafe-wp-apis
	__experimentalToggleGroupControl as ToggleGroupControl,
	// eslint-disable-next-line @wordpress/no-unsafe-wp-apis
	__experimentalToggleGroupControlOption as ToggleGroupControlOption,
} from '@wordpress/components';
import { check } from '@wordpress/icons';
import type { FilterOperator, FilterDef } from '../../types';

export const OPERATOR_LABELS: Record<string, string> = {
	is: __( 'Equals', 'primeplaced-advanced-password-protection'),
	isNot: __( 'Not equals', 'primeplaced-advanced-password-protection'),
	contains: __( 'Includes', 'primeplaced-advanced-password-protection'),
	notContains: __( 'Not includes', 'primeplaced-advanced-password-protection'),
	before: __( 'Before', 'primeplaced-advanced-password-protection'),
	after: __( 'After', 'primeplaced-advanced-password-protection'),
	on: __( 'On', 'primeplaced-advanced-password-protection'),
};

interface FilterDropdownContentProps {
	filterId: string;
	filterDef: FilterDef;
	activeFilter: any;
	onFilterChange: (id: string, val: any, op: FilterOperator) => void;
	onClose: () => void;
}

/**
 * Normalizes filter values into a string array without nested ternaries.
 *
 * @param activeFilter
 */
const getNormalizedFilterValues = (activeFilter: any): string[] => {
	if (!activeFilter?.value) {
		return [];
	}

	if (Array.isArray(activeFilter.value)) {
		return activeFilter.value.map(String);
	}

	return [String(activeFilter.value)];
};

export const FilterDropdownContent = ({
	filterId,
	filterDef,
	activeFilter,
	onFilterChange,
	onClose,
}: FilterDropdownContentProps) => {
	const defaultOperator = filterDef.operators?.[0] || 'is';
	const [localOperator, setLocalOperator] = useState<FilterOperator>(
		activeFilter?.operator || defaultOperator
	);
	const [localValue, setLocalValue] = useState<string>(
		typeof activeFilter?.value === 'string' ? activeFilter.value : ''
	);

	const handleOperatorChange = (val: string | number) => {
		const op = val as FilterOperator;
		setLocalOperator(op);
		onFilterChange(filterId, activeFilter?.value, op);
	};

	const handleValueChange = (val: string) => {
		setLocalValue(val);
		onFilterChange(filterId, val, localOperator);
	};

	const handleDateChange = (newDate: string | null | undefined) => {
		const val = newDate ? newDate.split('T')[0] : '';
		setLocalValue(val);
		onFilterChange(filterId, val, localOperator);
	};

	const operatorSelect = filterDef.operators &&
		filterDef.operators.length > 1 && (
			<ToggleGroupControl
				label={__( 'Select an operator', 'primeplaced-advanced-password-protection')}
				hideLabelFromVision={true}
				value={localOperator}
				onChange={(val: string | number | undefined) =>
					handleOperatorChange(val as FilterOperator)
				}
				isBlock
				className="ppadvp-datatable__active-filter-select"
				
				__next40pxDefaultSize
			>
				{filterDef.operators.map((op) => (
					<ToggleGroupControlOption
						key={op}
						value={op}
						label={OPERATOR_LABELS[op] || op}
					/>
				))}
			</ToggleGroupControl>
		);

	if (filterDef.type === 'text') {
		return (
			<div className="ppadvp-datatable__active-filter-dropdown-content">
				{operatorSelect}
				<TextControl
					label={__( 'Value', 'primeplaced-advanced-password-protection')}
					hideLabelFromVision
					value={localValue}
					onChange={handleValueChange}
					placeholder={__( 'Type text…',
						'primeplaced-advanced-password-protection'
					)}
					
					__next40pxDefaultSize
				/>
			</div>
		);
	}

	if (filterDef.type === 'date') {
		return (
			<div className="ppadvp-datatable__active-filter-dropdown-content">
				{operatorSelect}

				<TextControl
					type="date"
					label={__( 'Choose a date', 'primeplaced-advanced-password-protection')}
					value={localValue}
					onChange={handleValueChange}
					hideLabelFromVision
					
					__next40pxDefaultSize
				/>

				<DatePicker
					currentDate={localValue}
					onChange={handleDateChange}
				/>
			</div>
		);
	}

	const currentValues = getNormalizedFilterValues(activeFilter);

	return (
		<div className="ppadvp-datatable__active-filter-dropdown-content">
			{operatorSelect && <div>{operatorSelect}</div>}
			<MenuGroup>
				{filterDef.options?.map((opt) => {
					const stringOptVal = String(opt.value);
					const isSelected = currentValues.includes(stringOptVal);

					return (
						<MenuItem
							key={stringOptVal}
							icon={isSelected ? check : undefined}
							onClick={() => {
								let newValues;
								if (isSelected) {
									newValues = currentValues.filter(
										(v) => v !== stringOptVal && v !== ''
									);
								} else {
									newValues = [
										...currentValues.filter(
											(v) => v !== ''
										),
										stringOptVal,
									];
								}

								onFilterChange(
									filterId,
									newValues,
									localOperator
								);
							}}
						>
							{opt.label}
						</MenuItem>
					);
				})}
			</MenuGroup>
		</div>
	);
};
