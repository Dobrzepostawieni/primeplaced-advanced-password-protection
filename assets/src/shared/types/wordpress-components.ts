/**
 * Callback contract exposed by WordPress' Dropdown component.
 */
export interface DropdownRenderProps {
	isOpen: boolean;
	onToggle: () => void;
	onClose: () => void;
}
