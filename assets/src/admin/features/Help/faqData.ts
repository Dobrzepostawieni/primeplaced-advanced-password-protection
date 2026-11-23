/*
 * Pro Features Data.
 *
 * @package
 */
import { __ } from '@wordpress/i18n';

export type FaqTier = 'free' | 'basic' | 'business' | 'agency';

export const TAG_ORDER = [
	'Overview',
	'Access Rules',
	'Passwords',
	'Cookies',
	'Templates',
	'Security',
	'Advanced',
	'Statistics',
	'Support',
	'General',
] as const;

export type FaqTag = (typeof TAG_ORDER)[number];

export interface FaqItem {
	id: string;
	question: string;
	answer: string;
	tier: FaqTier;
	tag?: string;
}

const faqFreeOverview: FaqItem[] = [
	{
		id: 'overview-enable-protection',
		tier: 'free',
		tag: 'Overview',
		question: __(
			'How to enable site-wide protection?',
			'primeplaced-advanced-password-protection'
		),
		answer: __(
			'Toggle the *Protection system status* to "on" in the Overview tab. In the free version, you can create password that locks the entire WordPress site behind a secure screen.',
			'primeplaced-advanced-password-protection'
		),
	},
	{
		id: 'overview-disable-protection',
		tier: 'free',
		tag: 'Overview',
		question: __(
			'How to temporarily disable protection?',
			'primeplaced-advanced-password-protection'
		),
		answer: __(
			'Toggle the *Protection system status* to "off". The site instantly becomes public again. Your password and configuration remain saved in the database, allowing you to re-enable the lock at any time.',
			'primeplaced-advanced-password-protection'
		),
	},
];

const faqFreePasswords: FaqItem[] = [
	{
		id: 'passwords-management',
		tier: 'free',
		tag: 'Passwords',
		question: __(
			'How to manage access passwords?',
			'primeplaced-advanced-password-protection'
		),
		answer: __(
			'In the *Passwords* tab, you can manage your passwords. Use the toggle in the *Status* column to instantly deactivate a password without deleting it. Any visitor currently browsing with a deactivated password will be immediately locked out.',
			'primeplaced-advanced-password-protection'
		),
	},
	{
		id: 'passwords-visibility',
		tier: 'free',
		tag: 'Passwords',
		question: __(
			'How to reveal masked passwords?',
			'primeplaced-advanced-password-protection'
		),
		answer: __(
			'Password values are obfuscated by default to prevent accidental exposure. Click the *👁 (eye) icon* inside the password cell to reveal the text and copy it.',
			'primeplaced-advanced-password-protection'
		),
	},
];

const faqFreeCookies: FaqItem[] = [
	{
		id: 'cookies-duration',
		tier: 'free',
		tag: 'Cookies',
		question: __(
			'How to control the access duration for visitors?',
			'primeplaced-advanced-password-protection'
		),
		answer: __(
			'The *Cookies and session* settings determine how long a visitor stays unlocked. *Specific time* remembers their authentication for a defined number of days. *Session* instantly revokes access the moment they close their browser.',
			'primeplaced-advanced-password-protection'
		),
	},
	{
		id: 'cookies-force-logout',
		tier: 'free',
		tag: 'Security',
		question: __(
			'How to force all users to log in again?',
			'primeplaced-advanced-password-protection'
		),
		answer: __(
			'Click the *Force all users to log in again* button in the Security section. The system automatically regenerates the cryptographic session salt, which instantly invalidates all active cookies and locks out everyone currently browsing the site.',
			'primeplaced-advanced-password-protection'
		),
	},
];

const faqGeneral: FaqItem[] = [
	{
		id: 'general-caching',
		tier: 'free',
		tag: 'General',
		question: __(
			'Does the plugin work with caching systems?',
			'primeplaced-advanced-password-protection'
		),
		answer: __(
			'Yes. The plugin features an integrated cache-busting engine. It automatically prevents caching plugins (like LiteSpeed or WP Rocket) from serving locked pages to authenticated users, and automatically purges the cache when protection settings are updated.',
			'primeplaced-advanced-password-protection'
		),
	},
	{
		id: 'general-appearance',
		tier: 'free',
		tag: 'Templates',
		question: __(
			'How to customize the lock screen design?',
			'primeplaced-advanced-password-protection'
		),
		answer: __(
			'Navigate to the *Templates* tab. You can upload a custom logo, modify the header text, and adjust the background and button colors. The system dynamically checks color contrast for accessibility (WCAG) and applies changes instantly to the live preview.',
			'primeplaced-advanced-password-protection'
		),
	},
];

const faqBasic: FaqItem[] = [
	{
		id: 'basic-local-protection',
		tier: 'basic',
		tag: 'Overview',
		question: __(
			'How to enable local protection (individual password) for a selected post?',
			'primeplaced-advanced-password-protection'
		),
		answer: __(
			'To protect a specific post or page with a dedicated password, open it in the WordPress editor. In the right sidebar, you will find a dedicated tab for our plugin. Simply activate local protection there, enter the password, and save the post.',
			'primeplaced-advanced-password-protection'
		),
	},
	{
		id: 'basic-admin-columns',
		tier: 'basic',
		tag: 'Overview',
		question: __(
			'Can I check the protection status directly from the main posts list?',
			'primeplaced-advanced-password-protection'
		),
		answer: __(
			"Yes! The plugin adds a special column to the standard WordPress dashboard table. It allows you to see at a glance what type of protection is applied (Global, Rule, or Local). You don't have to enter each post to check if it is secure.",
			'primeplaced-advanced-password-protection'
		),
	},
	{
		id: 'basic-post-page-protection',
		tier: 'basic',
		tag: 'Access Rules',
		question: __(
			'How to protect specific pages or posts instead of the full site?',
			'primeplaced-advanced-password-protection'
		),
		answer: __(
			'Switch the operating mode to *Access rules* in the Overview tab. You can create up to 3 custom rules in the Basic plan to assign dedicated passwords specifically to standard Posts and Pages, leaving the rest of the site public.',
			'primeplaced-advanced-password-protection'
		),
	},
	{
		id: 'basic-password-scheduling',
		tier: 'basic',
		tag: 'Passwords',
		question: __(
			'How to schedule a password to expire automatically?',
			'primeplaced-advanced-password-protection'
		),
		answer: __(
			'When adding or editing a password, use the *Valid from* and *Valid until* fields. The system automatically monitors the time and changes the password status to "Expired" once the deadline passes. The Basic plan allows up to 3 active passwords.',
			'primeplaced-advanced-password-protection'
		),
	},
	{
		id: 'basic-do-not-remember',
		tier: 'basic',
		tag: 'Cookies',
		question: __(
			'How to force authentication on every page reload?',
			'primeplaced-advanced-password-protection'
		),
		answer: __(
			'Change the cookie type to *Do not remember*. The system will not store any session tokens, forcing the visitor to type the password every time they navigate to a new protected page or refresh the browser.',
			'primeplaced-advanced-password-protection'
		),
	},
	{
		id: 'basic-remember-me',
		tier: 'basic',
		tag: 'Cookies',
		question: __(
			'What is the "Remember me" option?',
			'primeplaced-advanced-password-protection'
		),
		answer: __(
			'Enabling this option displays a "Remember me" checkbox on the lock screen. It delegates the choice to the visitor: if checked, they receive a persistent cookie; if unchecked, they receive a strict session cookie.',
			'primeplaced-advanced-password-protection'
		),
	},
	{
		id: 'basic-ip-whitelist',
		tier: 'basic',
		tag: 'Advanced',
		question: __(
			'How to grant automatic access to specific IP addresses?',
			'primeplaced-advanced-password-protection'
		),
		answer: __(
			'Add the IP addresses to the *Allowed IP addresses* list in the Advanced tab. Visitors connecting from these recognized IPs completely bypass the lock screen. The Basic plan allows up to 2 whitelisted IP addresses.',
			'primeplaced-advanced-password-protection'
		),
	},
	{
		id: 'basic-role-permissions',
		tier: 'basic',
		tag: 'Advanced',
		question: __(
			'How to allow logged-in WordPress users to bypass the lock?',
			'primeplaced-advanced-password-protection'
		),
		answer: __(
			"In the *Role permissions* section, select user roles (e.g., Subscribers) that should bypass the frontend lock screen. You can also grant specific roles backend access to manage this plugin's settings.",
			'primeplaced-advanced-password-protection'
		),
	},
	{
		id: 'basic-import-export',
		tier: 'basic',
		tag: 'Advanced',
		question: __(
			'Can I export my passwords to another site?',
			'primeplaced-advanced-password-protection'
		),
		answer: __(
			'Yes! In the Basic plan, the *Import / Export* module allows you to download your entire password list as a JSON file and safely import it to another WordPress instance.',
			'primeplaced-advanced-password-protection'
		),
	},
	{
		id: 'basic-custom-templates',
		tier: 'basic',
		tag: 'Templates',
		question: __(
			'How to create custom lock screen layouts?',
			'primeplaced-advanced-password-protection'
		),
		answer: __(
			'The plugin registers a dedicated "Lock Templates" Custom Post Type. Click *Create new template* to open the WordPress Gutenberg editor. You can use the built-in "Password Form" block alongside native blocks to design custom login screens.',
			'primeplaced-advanced-password-protection'
		),
	},
	{
		id: 'basic-statistics',
		tier: 'basic',
		tag: 'Statistics',
		question: __(
			'What data is tracked in the Statistics tab?',
			'primeplaced-advanced-password-protection'
		),
		answer: __(
			'The system records authentication attempts, tracking successful logins, failed attempts, and unique users. The Basic plan provides a 7-day overview through scorecards and an activity log holding up to 200 recent events.',
			'primeplaced-advanced-password-protection'
		),
	},
];

const faqBusiness: FaqItem[] = [
	{
		id: 'business-woo-protection',
		tier: 'business',
		tag: 'Access Rules',
		question: __(
			'How to protect WooCommerce products and Categories?',
			'primeplaced-advanced-password-protection'
		),
		answer: __(
			'The Business plan extends the content picker. You can create up to 10 access rules and select "Products" or standard "Categories/Tags". Every item within the selected group automatically inherits the password requirement. Use the Exclude field to keep specific items public.',
			'primeplaced-advanced-password-protection'
		),
	},
	{
		id: 'business-recaptcha-v2',
		tier: 'business',
		tag: 'Security',
		question: __(
			'How to enable Google reCAPTCHA protection?',
			'primeplaced-advanced-password-protection'
		),
		answer: __(
			'Navigate to the *Bot protection* section in the Advanced tab. Enable the integration, select *reCAPTCHA v2*, and provide your keys. The system automatically renders a verification checkbox on the frontend form, blocking automated brute-force scripts.',
			'primeplaced-advanced-password-protection'
		),
	},
	{
		id: 'business-rate-limiting',
		tier: 'business',
		tag: 'Security',
		question: __(
			'How does the automated brute-force protection work?',
			'primeplaced-advanced-password-protection'
		),
		answer: __(
			'The system utilizes an internal Rate Limiter. If an IP address generates too many failed password attempts in a short period, the system temporarily blocks further requests from that IP, returning a 429 Too Many Requests response to mitigate the attack.',
			'primeplaced-advanced-password-protection'
		),
	},
	{
		id: 'business-import-export',
		tier: 'business',
		tag: 'Advanced',
		question: __(
			'How to migrate the rules and design configuration between websites?',
			'primeplaced-advanced-password-protection'
		),
		answer: __(
			'The Business plan extends the *Import / Export* module. You can download specific modules (Access Rules, Design, IP Whitelists) as JSON files. When importing, the system automatically resolves content IDs to slugs, ensuring rules map correctly even if post IDs differ on the destination site.',
			'primeplaced-advanced-password-protection'
		),
	},
	{
		id: 'business-statistics-extended',
		tier: 'business',
		tag: 'Statistics',
		question: __(
			'How to analyze activity trends over time?',
			'primeplaced-advanced-password-protection'
		),
		answer: __(
			'The Business plan extends statistics retention up to 30 days and 500 log entries. It unlocks the *Activity over time* line chart, visualizing authentication spikes to help you identify exact dates of bot attacks. You can also export the full log to a CSV file.',
			'primeplaced-advanced-password-protection'
		),
	},
];

const faqAgency: FaqItem[] = [
	{
		id: 'agency-unlimited',
		tier: 'agency',
		tag: 'Overview',
		question: __(
			'What limits does the Agency plan have?',
			'primeplaced-advanced-password-protection'
		),
		answer: __(
			'None. The Agency plan provides completely unlimited passwords, unlimited access rules, and an unlimited IP whitelist limit.',
			'primeplaced-advanced-password-protection'
		),
	},
	{
		id: 'agency-custom-taxonomies',
		tier: 'agency',
		tag: 'Access Rules',
		question: __(
			'How to protect Custom Post Types (CPT) and Custom Taxonomies?',
			'primeplaced-advanced-password-protection'
		),
		answer: __(
			'The system automatically detects all public Custom Post Types and Taxonomies registered on your WordPress instance. They appear dynamically in the Content Picker inside the Rule Modal, allowing you to lock portfolios, directories, or custom courses effortlessly.',
			'primeplaced-advanced-password-protection'
		),
	},
	{
		id: 'agency-recaptcha-v3',
		tier: 'agency',
		tag: 'Security',
		question: __(
			'How to use invisible reCAPTCHA v3?',
			'primeplaced-advanced-password-protection'
		),
		answer: __(
			'Select *reCAPTCHA v3* in the security settings. It operates silently in the background by analyzing user behavior and assigning a risk score. If the score indicates a bot, the system automatically rejects the login attempt without displaying any interactive challenges to real users.',
			'primeplaced-advanced-password-protection'
		),
	},
	{
		id: 'agency-log-management',
		tier: 'agency',
		tag: 'Advanced',
		question: __(
			'How to control the database size for activity logs?',
			'primeplaced-advanced-password-protection'
		),
		answer: __(
			'The *Activity Log Settings* provide manual control over database retention. You can specify the maximum number of log entries to store and the exact retention period in days (e.g. 365 days). An hourly cron job automatically prunes the SQL table to respect these precise limits.',
			'primeplaced-advanced-password-protection'
		),
	},
	{
		id: 'agency-import-export-full',
		tier: 'agency',
		tag: 'Advanced',
		question: __(
			'How to execute a full system backup?',
			'primeplaced-advanced-password-protection'
		),
		answer: __(
			'The Agency plan unlocks the *Full Backup* option in the Import/Export module. This generates a comprehensive JSON payload containing core settings, all PRO rules, IP exceptions, and reCAPTCHA configurations, allowing for a 1:1 clone of the entire security architecture.',
			'primeplaced-advanced-password-protection'
		),
	},
];

export const FAQ_ITEMS: FaqItem[] = [
	...faqGeneral,
	...faqFreeOverview,
	...faqFreePasswords,
	...faqFreeCookies,
	...faqBasic,
	...faqBusiness,
	...faqAgency,
];

export const FAQ_BY_TIER: Record<FaqTier, FaqItem[]> = {
	free: [
		...faqGeneral.filter((i) => i.tier === 'free'),
		...faqFreeOverview,
		...faqFreePasswords,
		...faqFreeCookies,
	],
	basic: [...faqGeneral.filter((i) => i.tier === 'basic'), ...faqBasic],
	business: [
		...faqGeneral.filter((i) => i.tier === 'business'),
		...faqBusiness,
	],
	agency: faqAgency,
};

export const FAQ_BY_TAG: Record<string, FaqItem[]> = FAQ_ITEMS.reduce(
	(acc, item) => {
		const tag = item.tag ?? 'General';
		if (!acc[tag]) acc[tag] = [];
		acc[tag].push(item);
		return acc;
	},
	{} as Record<string, FaqItem[]>
);
