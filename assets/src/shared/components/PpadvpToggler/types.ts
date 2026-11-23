/**
 * Types and interfaces for the PpadvpToggler component.
 */

/**
 * External dependencies
 */
import type { ReactNode } from 'react';

/**
 * Properties for the PpadvpToggler component.
 */
export interface PpadvpTogglerProps {
	/** The primary text label displayed next to the toggle switch. */
	label: string;

	/** The current state of the toggle (true for on, false for off). */
	checked: boolean;

	/** Callback function triggered when the toggle state is changed by the user. */
	onChange: (newValue: boolean) => void;

	/** Optional helper text or React elements displayed below the toggle control. */
	help?: string | ReactNode;

	/** If true, renders a loading placeholder skeleton instead of the actual toggle. */
	isLoading?: boolean;

	/** If true, disables the toggle and displays a spinner next to the label to indicate a save operation. */
	isSaving?: boolean;

	/** If true, explicitly disables interaction with the toggle switch. */
	disabled?: boolean;

	/** Optional additional CSS classes for the component wrapper. */
	className?: string;

	/** If true, applies a border styling around the toggle control. */
	hasBorder?: boolean;

	/** If true, renders a smaller visual variant of the toggle switch. */
	isSmall?: boolean;

	/** If true, applies specific PRO version styling to the toggle. */
	isPro?: boolean;
}
