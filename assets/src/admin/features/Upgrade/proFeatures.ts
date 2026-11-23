/**
 * Pro Features Data.
 *
 * @package
 */
import { __ } from '@wordpress/i18n';
import {
	shield,
	calendar,
	category,
	page,
	brush,
	people,
	globe,
	lock,
	chartBar,
	list,
	download,
	update,
	tag,
	archive,
	backup,
	starFilled,
	timeToRead,
	commentAuthorAvatar,
	unlock,
} from '@wordpress/icons';

export type ProPlanTier = 'basic' | 'business' | 'agency';

export interface ProFeature {
	icon: JSX.Element;
	title: string;
	description: string;
	plan: ProPlanTier;
	planLabel: string;
}

export const PRO_FEATURES: ProFeature[] = [
	// --- BASIC TIER ---
	{
		icon: lock,
		title: __( 'Access rules', 'primeplaced-advanced-password-protection'),
		description: __( 'Assign dedicated passwords to specific pages or posts without locking the entire website (up to 3 rules).',
			'primeplaced-advanced-password-protection'
		),
		plan: 'basic',
		planLabel: 'Basic',
	},
	{
		icon: calendar,
		title: __( 'Password scheduling', 'primeplaced-advanced-password-protection'),
		description: __( 'Set exact start and expiration dates for passwords. The system activates and revokes them automatically.',
			'primeplaced-advanced-password-protection'
		),
		plan: 'basic',
		planLabel: 'Basic',
	},
	{
		icon: page,
		title: __( 'Pages & Posts', 'primeplaced-advanced-password-protection'),
		description: __( 'Protect entire groups of pages or post categories simultaneously. Exclude specific items to keep them public.',
			'primeplaced-advanced-password-protection'
		),
		plan: 'basic',
		planLabel: 'Basic',
	},
	{
		icon: brush,
		title: __( 'Visual form builder', 'primeplaced-advanced-password-protection'),
		description: __( 'Design fully custom lock screens directly in the Gutenberg editor using native blocks.',
			'primeplaced-advanced-password-protection'
		),
		plan: 'basic',
		planLabel: 'Basic',
	},
	{
		icon: people,
		title: __( 'Role permissions', 'primeplaced-advanced-password-protection'),
		description: __( 'Allow logged-in users (e.g., Subscribers) to automatically bypass the password screen.',
			'primeplaced-advanced-password-protection'
		),
		plan: 'basic',
		planLabel: 'Basic',
	},
	{
		icon: globe,
		title: __( 'IP Whitelist', 'primeplaced-advanced-password-protection'),
		description: __( 'Grant instant access to up to 2 specific IP addresses, completely bypassing the lock screen.',
			'primeplaced-advanced-password-protection'
		),
		plan: 'basic',
		planLabel: 'Basic',
	},
	{
		icon: timeToRead,
		title: __( 'Strict session control', 'primeplaced-advanced-password-protection'),
		description: __( 'Force users to authenticate on every page reload by disabling session cookies entirely.',
			'primeplaced-advanced-password-protection'
		),
		plan: 'basic',
		planLabel: 'Basic',
	},
	{
		icon: commentAuthorAvatar,
		title: __( 'Enable "Remember Me" option',
			'primeplaced-advanced-password-protection'
		),
		description: __( 'By default, the password is remembered only for the session duration. Enabling this option adds a checkbox to the form, allowing users to keep access for longer (expires after closing the browser).',
			'primeplaced-advanced-password-protection'
		),
		plan: 'basic',
		planLabel: 'Basic',
	},
	{
		icon: chartBar,
		title: __( 'Basic statistics', 'primeplaced-advanced-password-protection'),
		description: __( 'Track successful and failed login attempts with a 30-day dashboard overview.',
			'primeplaced-advanced-password-protection'
		),
		plan: 'basic',
		planLabel: 'Basic',
	},
	{
		icon: list,
		title: __( 'Activity logs', 'primeplaced-advanced-password-protection'),
		description: __( 'Keep an eye on traffic with a detailed log storing the 200 most recent authentication events (up to 7 days).',
			'primeplaced-advanced-password-protection'
		),
		plan: 'basic',
		planLabel: 'Basic',
	},

	// --- BUSINESS TIER ---
	{
		icon: category,
		title: __( 'Categories & WooCommerce', 'primeplaced-advanced-password-protection'),
		description: __( 'Protect entire product groups or standard categories at once. Exclude specific items to keep them public.',
			'primeplaced-advanced-password-protection'
		),
		plan: 'business',
		planLabel: 'Business',
	},
	{
		icon: shield,
		title: __( 'Google reCAPTCHA v2', 'primeplaced-advanced-password-protection'),
		description: __( 'Stop brute-force scripts with Google\'s interactive "I\'m not a robot" checkbox on the login screen.',
			'primeplaced-advanced-password-protection'
		),
		plan: 'business',
		planLabel: 'Business',
	},
	{
		icon: chartBar,
		title: __( 'Timeline statistics', 'primeplaced-advanced-password-protection'),
		description: __( 'Analyze traffic spikes and bot attacks with a line chart showing activity over time (up to 30 days retention).',
			'primeplaced-advanced-password-protection'
		),
		plan: 'business',
		planLabel: 'Business',
	},
	{
		icon: download,
		title: __( 'CSV reports', 'primeplaced-advanced-password-protection'),
		description: __( 'Export your entire activity log to a CSV file for external auditing and reporting.',
			'primeplaced-advanced-password-protection'
		),
		plan: 'business',
		planLabel: 'Business',
	},
	{
		icon: update,
		title: __( 'Modular Import / Export', 'primeplaced-advanced-password-protection'),
		description: __( 'Migrate specific configuration modules (like Rules, Design, or Whitelists) between websites via JSON files.',
			'primeplaced-advanced-password-protection'
		),
		plan: 'business',
		planLabel: 'Business',
	},

	// --- AGENCY TIER ---
	{
		icon: unlock,
		title: __( 'Unlimited limits', 'primeplaced-advanced-password-protection'),
		description: __( 'No limits on passwords, rules, or IP whitelists. Manage protection for dozens of campaigns effortlessly.',
			'primeplaced-advanced-password-protection'
		),
		plan: 'agency',
		planLabel: 'Agency',
	},
	{
		icon: tag,
		title: __( 'Custom Taxonomies & CPT', 'primeplaced-advanced-password-protection'),
		description: __( 'Seamlessly lock ANY custom post types like portfolios, directories, or online courses.',
			'primeplaced-advanced-password-protection'
		),
		plan: 'agency',
		planLabel: 'Agency',
	},
	{
		icon: shield,
		title: __( 'Invisible reCAPTCHA v3', 'primeplaced-advanced-password-protection'),
		description: __( 'Block bots silently in the background based on risk scores, creating zero friction for real users.',
			'primeplaced-advanced-password-protection'
		),
		plan: 'agency',
		planLabel: 'Agency',
	},
	{
		icon: archive,
		title: __( 'Custom log retention', 'primeplaced-advanced-password-protection'),
		description: __( 'Take full control of your database footprint by manually setting strict log limits and expiration days.',
			'primeplaced-advanced-password-protection'
		),
		plan: 'agency',
		planLabel: 'Agency',
	},
	{
		icon: backup,
		title: __( 'Full system backup', 'primeplaced-advanced-password-protection'),
		description: __( 'Clone your entire security architecture 1:1, including core settings, all rules, and reCAPTCHA keys.',
			'primeplaced-advanced-password-protection'
		),
		plan: 'agency',
		planLabel: 'Agency',
	},
	{
		icon: starFilled,
		title: __( 'Content & Password Rankings',
			'primeplaced-advanced-password-protection'
		),
		description: __( 'Unlocks "Top Content" and "Top Passwords" bar charts to track which pages and campaigns generate the most traffic.',
			'primeplaced-advanced-password-protection'
		),
		plan: 'agency',
		planLabel: 'Agency',
	},
];
