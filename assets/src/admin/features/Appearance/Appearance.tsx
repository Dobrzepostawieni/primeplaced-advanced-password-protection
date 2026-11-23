/**
 * Appearance Settings Tab.
 *
 * @package
 */

import { __ } from '@wordpress/i18n';
import { useMemo } from '@wordpress/element';
import { applyFilters } from '@wordpress/hooks';
import { useSettingsDispatch, useSettingsStateContext } from '@shared/contexts';
import {
	StickyLayout,
	type StickySectionDef,
} from '@admin/components/StickyLayout';
import type { SettingsComponentProps } from '@admin/components/AnimatedTabs';
import { AppearanceForm } from './components/AppearanceForm';

export const Appearance = ({ className }: SettingsComponentProps) => {
	const { saveSettings, discard } = useSettingsDispatch();
	const { settings } = useSettingsStateContext();

	const baseSections: StickySectionDef[] = useMemo(
		() => [
			{
				id: 'design',
				title: __(
					'Lock screen personalization',
					'primeplaced-advanced-password-protection'
				),
				component: AppearanceForm,
			},
		],
		[]
	);

	const sections = useMemo(() => {
		return applyFilters(
			'ppadvp.ui.AppearanceSections',
			baseSections
		) as StickySectionDef[];
	}, [baseSections]);

	const handleSave = () => {
		if (settings) {
			saveSettings(settings, 'SETTINGS_SAVE_SUCCESS');
		}
	};

	return (
		<StickyLayout
			title={__('Templates', 'primeplaced-advanced-password-protection')}
			sections={sections}
			onSave={handleSave}
			onDiscard={discard}
			className={className}
		/>
	);
};
