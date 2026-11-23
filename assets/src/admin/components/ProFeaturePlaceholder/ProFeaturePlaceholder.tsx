import { cn } from '@shared/utils/formatting';
import { Button, Card, CardBody, CardMedia } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

import type { ProFeaturePlaceholderProps } from './types';

import './ProFeaturePlaceholder.scss';

export const ProFeaturePlaceholder = ({
	imageSrc,
	imageAlt = '',
	title,
	description,
	features = [],
	buttonText = __( 'Upgrade to PRO', 'primeplaced-advanced-password-protection'),
	buttonUrl = 'https://dobrzepostawieni.pl/advanced-password-protection/',
	className,
}: ProFeaturePlaceholderProps) => {
	return (
		<Card
			className={cn(
				'ppadvp-settings-card ppadvp-settings-card-placeholder',
				className
			)}
		>
			<CardBody className="ppadvp-settings-card-placeholder-body">
				<h3 className="ppadvp-settings-card-placeholder-title">
					{title}
				</h3>
				<p className="ppadvp-settings-card-placeholder-desc">
					{description}
				</p>

				{features.length > 0 && (
					<ul className="ppadvp-settings-card-placeholder-list">
						{features.map((feature, index) => (
							<li key={index}>{feature}</li>
						))}
					</ul>
				)}

				<Button
					variant="primary"
					href={buttonUrl}
					target="_blank"
					className="ppadvp-button is-pro"
				>
					{buttonText}
				</Button>
			</CardBody>
			<CardMedia>
				<img
					src={imageSrc}
					alt={imageAlt}
					className="ppadvp-settings-card-placeholder-img"
				/>
			</CardMedia>
		</Card>
	);
};
