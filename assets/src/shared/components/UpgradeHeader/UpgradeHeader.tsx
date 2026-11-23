import { __ } from '@wordpress/i18n';
import { Button, Icon } from '@wordpress/components';
import { starFilled } from '@wordpress/icons';

import './UpgradeHeader.scss';

export const handleOpenLink = (url: string): void => {
	window.open(url, '_blank', 'noopener,noreferrer');
};

export const handleOpenInternalLink = (path: string): void => {
    window.open(path, '_self');
};

export type UpgradeHeaderContext = 'pricing' | 'main';

export interface UpgradeHeaderProps {
	context?: UpgradeHeaderContext;
}

export const UpgradeHeader = ({
	context = 'main',
}: UpgradeHeaderProps): JSX.Element => {
	return (
		<div className="ppadvp-upgrade-hero is-pro">
			<h2>
				<Icon icon={starFilled} />
				{__(
					'PrimePlaced - Password Protect Site & Staging PRO',
					'primeplaced-advanced-password-protection'
				)}
			</h2>
			<p>
				{__(
					"Unlock the full potential of your site's protection. More passwords, granular rules, advanced analytics, and premium support.",
					'primeplaced-advanced-password-protection'
				)}
			</p>
			<div className="ppadvp-upgrade-hero-btns">
				{context !== 'pricing' && (
					<Button
						variant="primary"
						className="ppadvp-button is-white"
						onClick={() =>
							handleOpenInternalLink(
								'admin.php?page=primeplaced-advanced-password-protection-pricing'
							)
						}
					>
						{__(
							'View plans and pricing →',
							'primeplaced-advanced-password-protection'
						)}
					</Button>
				)}
				<Button
					variant="tertiary"
					className="ppadvp-button is-white"
					onClick={() =>
						handleOpenLink(
							'https://dobrzepostawieni.pl/advanced-password-protection/#comparison'
						)
					}
				>
					{__('Compare all features', 'primeplaced-advanced-password-protection')}
				</Button>
			</div>
		</div>
	);
};
