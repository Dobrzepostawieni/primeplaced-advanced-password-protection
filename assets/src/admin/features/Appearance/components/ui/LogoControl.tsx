import { __ } from '@wordpress/i18n';
import { useSelect } from '@wordpress/data';
import {
	Button,
	RangeControl,
	ToggleControl,
	Icon,
	Tooltip,
} from '@wordpress/components';
import type { MouseEvent } from 'react';
import { useRef } from '@wordpress/element';
import { chevronUpDown, code, reset } from '@wordpress/icons';
import { useNotices } from '@shared/components/Notices';
import type { AppearanceUiComponentProps } from '../AppearanceForm';

export const LogoControl = ({
	settings,
	defaults = {},
	updateSetting,
}: AppearanceUiComponentProps) => {
	const { notify } = useNotices();
	const frameRef = useRef<any>(null);
	const defaultWidth = defaults.logoWidth ?? 80;
	const defaultHeight = defaults.logoHeight ?? 80;
	const logoId = settings.logoId || 0;
	const display = settings.logoDisplay ?? true;
	const width = settings.logoWidth ?? defaultWidth;
	const height = settings.logoHeight ?? defaultHeight;

	const logoUrl = useSelect(
		(select) => {
			if (!logoId) {
				return null;
			}
			const coreStore = select('core') as any;
			const media = coreStore.getEntityRecord(
				'postType',
				'attachment',
				logoId
			);
			return media?.source_url || null;
		},
		[logoId]
	);

	const openMediaFrame = () => {
		// @ts-ignore
		if (typeof wp === 'undefined' || !wp.media) {
			notify('MEDIA_LIB_UNAVAILABLE');
			return;
		}
		if (frameRef.current) {
			frameRef.current.open();
			return;
		}
		// @ts-ignore
		frameRef.current = wp.media({
			title: __('Select or upload logo', 'primeplaced-advanced-password-protection'),
			multiple: false,
			library: { type: 'image' },
			button: {
				text: __('Use this logo', 'primeplaced-advanced-password-protection'),
			},
		});
		frameRef.current.on('select', () => {
			const attachment = frameRef.current
				.state()
				.get('selection')
				.first()
				.toJSON();
			updateSetting('logoId', attachment.id);
		});
		frameRef.current.open();
	};

	return (
		<>
			<div className="ppadvp-appearance-range-row ppadvp-appearance-range-row--toggle">
				<ToggleControl
					className="ppadvp-toggle-control ppadvp-appearance-toggle"
					label={
						display
							? __('Hide logo', 'primeplaced-advanced-password-protection')
							: __('Show logo', 'primeplaced-advanced-password-protection')
					}
					checked={display}
					onChange={(val) => updateSetting('logoDisplay', val)}
					style={{ marginBottom: '15px' }}
					
				/>
				{display && (
					<>
						{logoUrl ? (
							<div style={{ display: 'flex', gap: '8px' }}>
								<Button
									variant="secondary"
									onClick={openMediaFrame}
									className="ppadvp-button"
								>
									{__(
										'Change',
										'primeplaced-advanced-password-protection'
									)}
								</Button>
								<Button
									variant="secondary"
									isDestructive
									onClick={() => updateSetting('logoId', 0)}
									className="ppadvp-button"
								>
									{__(
										'Remove',
										'primeplaced-advanced-password-protection'
									)}
								</Button>
							</div>
						) : (
							<Button
								variant="primary"
								onClick={openMediaFrame}
								className="ppadvp-button"
							>
								{__(
									'Upload custom logo',
									'primeplaced-advanced-password-protection'
								)}
							</Button>
						)}
					</>
				)}
			</div>
			{logoUrl && (
				<div className="ppadvp-appearance-range-row">
					<div className="ppadvp-appearance-range-content">
						<Icon
							icon={code}
							className="ppadvp-appearance-range-icon"
						/>
						{width !== defaultWidth && (
							<Tooltip
								text={__(
									'Restore default value',
									'primeplaced-advanced-password-protection'
								)}
							>
								<Button
									size="compact"
									icon={reset}
									variant="tertiary"
									onClick={(e: MouseEvent) => {
										e.stopPropagation();
										updateSetting(
											'logoWidth',
											defaultWidth
										);
									}}
									aria-label={__(
										'Restore default width',
										'primeplaced-advanced-password-protection'
									)}
									className="ppadvp-appearance-range-reset"
								/>
							</Tooltip>
						)}
						<RangeControl
							label={__(
								'Width (px)',
								'primeplaced-advanced-password-protection'
							)}
							value={width}
							onChange={(val) =>
								updateSetting('logoWidth', val || 0)
							}
							min={50}
							max={300}
							className="ppadvp-appearance-range"
							__next40pxDefaultSize
							
						/>
					</div>
					<div className="ppadvp-appearance-range-content">
						<Icon
							icon={chevronUpDown}
							className="ppadvp-appearance-range-icon"
						/>
						{height !== defaultHeight && (
							<Tooltip
								text={__(
									'Restore default value',
									'primeplaced-advanced-password-protection'
								)}
							>
								<Button
									size="compact"
									icon={reset}
									variant="tertiary"
									onClick={(e: MouseEvent) => {
										e.stopPropagation();
										updateSetting(
											'logoHeight',
											defaultHeight
										);
									}}
									aria-label={__(
										'Restore default height',
										'primeplaced-advanced-password-protection'
									)}
									className="ppadvp-appearance-range-reset"
								/>
							</Tooltip>
						)}
						<RangeControl
							label={__(
								'Height (px)',
								'primeplaced-advanced-password-protection'
							)}
							value={height}
							onChange={(val) =>
								updateSetting('logoHeight', val || 0)
							}
							min={50}
							max={300}
							className="ppadvp-appearance-range"
							__next40pxDefaultSize
							
						/>
					</div>
				</div>
			)}
		</>
	);
};
