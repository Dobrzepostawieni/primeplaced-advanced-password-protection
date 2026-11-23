import { __ } from '@wordpress/i18n';
import { Modal, Button } from '@wordpress/components';
import type { ConfirmModalProps } from './types';
import './ConfirmModal.scss';

export const ConfirmModal = ({
	isOpen,
	title,
	message,
	confirmLabel = __( 'Approve', 'primeplaced-advanced-password-protection'),
	cancelLabel = __( 'Cancel', 'primeplaced-advanced-password-protection'),
	onConfirm,
	onCancel,
	isDestructive = true,
	isConfirming = false,
}: ConfirmModalProps) => {
	if (!isOpen) {
		return null;
	}

	const handleRequestClose = () => {
		if (isConfirming) return;
		onCancel();
	};

	return (
		<Modal
			title={title}
			onRequestClose={handleRequestClose}
			shouldCloseOnClickOutside={!isConfirming}
			shouldCloseOnEsc={!isConfirming}
			className="ppadvp-confirmation-modal ppadvp-modal"
		>
			<div className="ppadvp-confirmation-modal__body">
				<p className="ppadvp-confirmation-modal__text">{message}</p>
				<div className="ppadvp-modal-footer">
					<div className="ppadvp-modal-footer-actions">
						<Button
							variant="tertiary"
							onClick={handleRequestClose}
							disabled={isConfirming}
							className="ppadvp-button"
						>
							{cancelLabel}
						</Button>
						<Button
							variant="primary"
							isDestructive={isDestructive}
							onClick={onConfirm}
							isBusy={isConfirming}
							disabled={isConfirming}
							className="ppadvp-button"
						>
							{confirmLabel}
						</Button>
					</div>
				</div>
			</div>
		</Modal>
	);
};
