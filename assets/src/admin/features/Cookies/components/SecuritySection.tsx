/**
 * Security Section Component.
 *
 * @package
 */

import { __ } from '@wordpress/i18n';
import { CardHeader, CardBody, Button, Card } from '@wordpress/components';
import { cn } from '@shared/utils/formatting';
import { ConfirmModal } from '@admin/components/ConfirmModal';
import type { StickySectionProps } from '@admin/components/StickyLayout';
import { useCookies } from '../useCookies';

export const SecuritySection = ({
	spyRef,
	className,
	isActive,
}: StickySectionProps) => {
	const {
		isConfirmOpen,
		isSaving,
		openConfirmModal,
		closeConfirmModal,
		handleForceLogout,
	} = useCookies();

	return (
		<>
			<Card
				className={cn(className, isActive && 'ppadvp-is-active')}
				ref={spyRef as any}
			>
				<CardHeader className="ppadvp-settings-card-header">
					<h2>{__('Security', 'primeplaced-advanced-password-protection')}</h2>
				</CardHeader>
				<CardBody className="ppadvp-settings-card-body">
					<div className="ppadvp-settings-card-headings">
						<h3 className="ppadvp-settings-card-heading">
							{__(
								'Force re-authentication for all active sessions.',
								'primeplaced-advanced-password-protection'
							)}
						</h3>
					</div>
					<Button
						variant="secondary"
						isDestructive
						onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
							e.currentTarget.blur();
							openConfirmModal();
						}}
						disabled={isSaving}
						className="ppadvp-button ppadvp-cookies-button"
					>
						{__(
							'Force all users to log in again',
							'primeplaced-advanced-password-protection'
						)}
					</Button>
					<div className="ppadvp-settings-card-headings">
						<p className="ppadvp-settings-card-description">
							{__(
								'Clicking will invalidate all active cookies. Every user will have to provide the password again.',
								'primeplaced-advanced-password-protection'
							)}
						</p>
					</div>
				</CardBody>
			</Card>

			<ConfirmModal
				isOpen={isConfirmOpen}
				title={__('Confirm action', 'primeplaced-advanced-password-protection')}
				message={__(
					'Are you sure you want to log out all users? This action cannot be undone.',
					'primeplaced-advanced-password-protection'
				)}
				confirmLabel={__(
					'Log out everyone',
					'primeplaced-advanced-password-protection'
				)}
				onConfirm={handleForceLogout}
				onCancel={closeConfirmModal}
				isDestructive
			/>
		</>
	);
};
