import { registerUpgradeTab } from '@admin/features/Upgrade';
import { doAction } from '@wordpress/hooks';

export const initializePlaceholdersLogic = () => {
	registerUpgradeTab();

	doAction('ppadvp.extensions.loaded');
};
