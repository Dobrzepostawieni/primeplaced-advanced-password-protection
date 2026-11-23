/**
 * Upgrade to PRO Tab Component.
 *
 * @package
 */
import { __ } from '@wordpress/i18n';
import { Button, Card, CardBody, Icon } from '@wordpress/components';
import { useSettingsStateContext } from '@shared/contexts';
import { PRO_FEATURES } from './proFeatures';
import './Upgrade.scss';

import {
	UpgradeHeader,
	handleOpenLink,
	handleOpenInternalLink,
} from '@shared/components/UpgradeHeader';

const PLAN_WEIGHTS: Record<string, number> = {
	free: 0,
	basic: 1,
	business: 2,
	agency: 3,
};

export const Upgrade = (): JSX.Element => {
	const { ppadvpData } = useSettingsStateContext();
	const currentPlan = ppadvpData?.active_plan || 'free';
	const currentPlanWeight = PLAN_WEIGHTS[currentPlan] ?? 0;

	const visibleFeatures = PRO_FEATURES.filter((feature) => {
		const featureWeight = PLAN_WEIGHTS[feature.plan] ?? 0;
		return featureWeight > currentPlanWeight;
	});

	return (
		<>
			<UpgradeHeader />

			<Card className="ppadvp-settings-card">
				<CardBody className="ppadvp-pro-feature-grid">
					{visibleFeatures.map((feature, index) => (
						<div
							key={index}
							className={`ppadvp-pro-feature-card is-${feature.plan}`}
						>
							<div className="ppadvp-pro-feature-card-icon">
								<Icon icon={feature.icon} />
							</div>
							<span className="ppadvp-pro-feature-card-badge">
								{feature.planLabel}
							</span>
							<h3 className="ppadvp-pro-feature-card-title">
								{feature.title}
							</h3>
							<p className="ppadvp-pro-feature-card-description">
								{feature.description}
							</p>
						</div>
					))}
				</CardBody>
			</Card>

			<Card className="ppadvp-settings-card">
				<CardBody className="ppadvp-upgrade-footer">
					<div className="ppadvp-upgrade-footer-header">
						<h4>
							{__(
								'Ready for more?',
								'primeplaced-advanced-password-protection'
							)}
						</h4>
						<p>
							{__(
								'Compare Basic, Business, and Agency plans on our website.',
								'primeplaced-advanced-password-protection'
							)}
						</p>
					</div>

					<div className="ppadvp-upgrade-footer-actions">
						<Button
							variant="primary"
							className="ppadvp-button is-pro"
							onClick={() =>
								handleOpenInternalLink(
									'admin.php?page=primeplaced-advanced-password-protection-pricing'
								)
							}
						>
							{__(
								'View pricing →',
								'primeplaced-advanced-password-protection'
							)}
						</Button>
						<Button
							variant="tertiary"
							className="ppadvp-button"
							onClick={() =>
								handleOpenLink(
									'https://dobrzepostawieni.pl/advanced-password-protection/documentation'
								)
							}
						>
							{__(
								'Documentation',
								'primeplaced-advanced-password-protection'
							)}
						</Button>
					</div>
				</CardBody>
			</Card>
		</>
	);
};
