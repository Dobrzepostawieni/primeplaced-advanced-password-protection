import { useContext } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { Card, CardBody, CardHeader, Button, Icon } from '@wordpress/components';
import { create, key as keyIcon, pencil, trash } from '@wordpress/icons';
import { PpadvpToggler } from '@shared/components/PpadvpToggler';
import { cn } from '@shared/utils/formatting';
import type { StickySectionProps } from '@admin/components/StickyLayout';

import { PasswordsContext } from '../context';
import type { PasswordViewEntry } from '../types';
import { PasswordCell } from './PasswordCell';

export const MasterPasswordSection = ({
	title,
	spyRef,
	isActive,
	className,
}: StickySectionProps) => {
	const context = useContext(PasswordsContext);

	if (!context) {
		return null;
	}

	const {
		tableData,
		isLoading,
		isSaving,
		openMasterPasswordModal,
		openEditModal,
		requestDeletePasswords,
		updateStatus,
	} = context;
	const masterPassword = tableData[0] as PasswordViewEntry | undefined;
	const statusClass = masterPassword?.status_class || 'is-gray';
	const statusLabel = masterPassword
		? masterPassword.status_label ||
		  (masterPassword.is_active
				? __('Active', 'primeplaced-advanced-password-protection')
				: __('Inactive', 'primeplaced-advanced-password-protection'))
		: '';
	const toggleLabel = masterPassword?.is_active
		? __('Deactivate password', 'primeplaced-advanced-password-protection')
		: __('Activate password', 'primeplaced-advanced-password-protection');

	return (
		<Card
			className={cn(
				'ppadvp-settings-card',
				className,
				isActive && 'ppadvp-is-active'
			)}
			ref={spyRef as any}
		>
			<CardHeader className="ppadvp-settings-card-header">
				<h2>{title}</h2>
			</CardHeader>
			<CardBody className="ppadvp-settings-card-body">
				{isLoading && (
					<div className="ppadvp-master-password-loading">
						<div className="ppadvp-spinner" />
					</div>
				)}
				{!isLoading && masterPassword && (
					<div className="ppadvp-master-password-panel">
						<div
							className={cn(
								'ppadvp-master-password-row',
								statusClass
							)}
						>
							<div className="ppadvp-master-password-summary">
								<div className="ppadvp-master-password-toggle">
									<PpadvpToggler
										label={toggleLabel}
										checked={masterPassword.is_active}
										onChange={(newValue) =>
											updateStatus(
												masterPassword.id,
												newValue
											)
										}
										isSaving={isSaving}
										disabled={isSaving}
										isSmall
									/>
								</div>
								<div className="ppadvp-master-password-copy">
									<div className="ppadvp-master-password-heading">
										<h3>{masterPassword.name}</h3>
										<span
											className={cn(
												'ppadvp-master-password-status',
												statusClass
											)}
										>
											{statusLabel}
										</span>
									</div>
									<p>
										{__(
											'Visitors use this password to unlock the protected site.',
											'primeplaced-advanced-password-protection'
										)}
									</p>
								</div>
							</div>
							<div className="ppadvp-master-password-secret">
								<span className="ppadvp-master-password-label">
									{__(
										'Password',
										'primeplaced-advanced-password-protection'
									)}
								</span>
								<PasswordCell
									entry={masterPassword}
									isActivationLocked={false}
								/>
							</div>
							<div className="ppadvp-master-password-actions">
								<Button
									variant="secondary"
									icon={pencil}
									onClick={() =>
										openEditModal(masterPassword)
									}
									className="ppadvp-button"
								>
									{__(
										'Edit',
										'primeplaced-advanced-password-protection'
									)}
								</Button>
								<Button
									variant="tertiary"
									icon={trash}
									isDestructive
									onClick={() =>
										requestDeletePasswords([
											masterPassword.id,
										])
									}
									className="ppadvp-button"
								>
									{__(
										'Remove',
										'primeplaced-advanced-password-protection'
									)}
								</Button>
							</div>
						</div>
					</div>
				)}
				{!isLoading && !masterPassword && (
					<div className="ppadvp-master-password-empty">
						<div className="ppadvp-master-password-empty-icon">
							<Icon icon={keyIcon} size={28} />
						</div>
						<div className="ppadvp-master-password-empty-copy">
							<h3>
								{__(
									'Set your master password',
									'primeplaced-advanced-password-protection'
								)}
							</h3>
							<p>
								{__(
									'Create the password visitors use to unlock the site.',
									'primeplaced-advanced-password-protection'
								)}
							</p>
						</div>
						<Button
							variant="primary"
							icon={create}
							onClick={openMasterPasswordModal}
							className="ppadvp-button"
						>
							{__(
								'Set master password',
								'primeplaced-advanced-password-protection'
							)}
						</Button>
					</div>
				)}
			</CardBody>
		</Card>
	);
};
