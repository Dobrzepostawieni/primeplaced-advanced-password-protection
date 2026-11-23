/**
 * Global Window Type Definitions.
 * Integrates PHP-injected data structures into the browser Window object.
 */

import type { PpadvpData, PpadvpFrontData, Grecaptcha } from '@shared/types';

declare global {
	interface Window {
		jQuery: any; 
		ppadvpAdminData: PpadvpData;
		ppadvpFrontData: PpadvpFrontData;
		grecaptcha: Grecaptcha;
		ppadvpPricingData: {
			plugin_id: string;
			public_key: string;
			sandbox?: {
                ctx: string;
                token: string;
            } | null;
		};
		FS: {
			Checkout: {
				configure: (options: any) => any;
			};
		};
	}
}

declare module "*.css"
