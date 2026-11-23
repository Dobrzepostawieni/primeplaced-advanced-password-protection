=== PrimePlaced - Password Protect Site & Staging ===
Contributors: dobrzepostawieni
Donate link: https://dobrzepostawieni.pl/advp
Tags: password protect, password protection, private site, staging, sitewide
Requires at least: 6.2
Requires PHP: 7.4
Tested up to: 7.1
Stable tag: 1.0.3
License: GPL-3.0-or-later
License URI: https://www.gnu.org/licenses/gpl-3.0.html

Password protect your entire WordPress site - staging, client preview or private site - with one password and a branded lock screen.

== Description ==

PrimePlaced - Password Protect Site & Staging lets WordPress site owners password protect an entire site in under a minute. Set one password, switch protection on, and every visitor sees a branded lock screen before they can reach your content. No user accounts, no membership system, no coding.

Use it to keep a staging or development site closed, share a private preview with a client, run a private blog or internal site, or keep a site hidden during a migration. Once the correct password is entered, access is remembered for the current browser session or for the number of days you choose.

= Core features =

* Site-wide password protection with one primary password.
* Customizable lock screen: logo, background colors, heading, field labels, button text, and error message.
* Live design preview in the admin area.
* Session access or access remembered for a chosen number of days.
* Protection status widget on the WordPress dashboard.
* Cache-busting headers and built-in handling for LiteSpeed Cache and W3 Total Cache.
* Built-in throttling of repeated password attempts.

= Protection model =

PrimePlaced - Password Protect Site & Staging is designed so that protected content does not leak around the lock screen. When site-wide protection is on, the WordPress REST API and feeds are protected as well as regular pages, and authenticated pages are not stored as public cache entries.

The lock screen is served with a `noindex, nofollow` robots tag, so search engines stay out. Saved passwords are stored encrypted in your WordPress database, and the password screen is built with semantic landmarks, readable contrast, and full keyboard support.

= Pro features =

An optional paid Pro version is available separately. The free plugin is fully functional on its own and does not contain locked features.

Pro areas include multiple passwords, scheduled password activation and expiration, protection for individual posts, pages, WooCommerce products, categories, custom post types, and taxonomies, Gutenberg and classic editor integrations, password form blocks and lock screen templates, role and IP bypass, remember-me controls, Google reCAPTCHA v2/v3, activity logs, statistics, and import/export tools.

== Installation ==

1. Upload the plugin files to `/wp-content/plugins/primeplaced-advanced-password-protection/`, or install the plugin through the WordPress plugins screen.
2. Activate the plugin.
3. Open **Password Protect** in the WordPress admin menu.
4. Add a primary password, enable protection, and customize the lock screen.

== Frequently Asked Questions ==

= How do I password-protect my entire WordPress site? =

Install and activate the plugin, open **Password Protect** in the WordPress admin menu, add your primary password, enable site protection, and save the settings. Visitors will see the password screen before accessing the public frontend.

= How do I password protect a staging or development site? =

Install the plugin on the staging site, set a primary password, and enable site protection. Everyone who opens the staging URL sees the password screen first, so unfinished work stays private until you launch. When the site goes live, switch protection off or deactivate the plugin.

= How do I share a private preview with a client? =

Enable site protection and send your client the site address together with the password. They do not need a WordPress account. You can choose how many days their browser stays authorized, and changing the password ends access for everyone who had the old one.

= Will a password-protected site be hidden from Google? =

Search engines cannot get past the password screen, and the lock screen itself is served with a `noindex, nofollow` robots tag. Pages that were indexed before you enabled protection can stay in search results until the search engine crawls them again.

= Do visitors need a WordPress account or username? =

No. Visitors enter only the shared password. There are no usernames, registrations, or user roles to manage, which is what separates a password gate from a membership plugin.

= Does it protect the REST API and RSS feeds? =

Yes. When site-wide protection is on, WordPress REST API responses and feeds are protected as well as regular pages.

= Is this a maintenance mode or coming soon plugin? =

No. PrimePlaced is a password gate for private access, not a public coming-soon landing page. It's built for staging sites, development work, client previews, and private projects where visitors need to enter a password — it does not create a membership system.

= Can I customize the password screen? =

Yes. The free version lets you upload a logo, change background colors, and customize the heading, labels, button text, and error message. The Pro extension adds block-based forms and additional templates.

= Can I choose how long visitors stay logged in? =

Yes. Choose a browser session or set a duration in days for the access cookie. The free version controls how long an authenticated visitor stays signed in; automatic password activation and expiration dates are available in Pro.

= Can I protect only a specific page or post? =

The free version protects the whole public site with one primary password. Pro adds rules for individual posts, pages, products, categories, custom post types, and taxonomies.

= Does the free version support multiple passwords? =

The free version uses one primary, site-wide password. Pro adds multiple passwords with separate access rules and schedules.

= Can administrators bypass the lock screen? =

Yes, administrators can always manage the plugin from the WordPress admin area. Pro adds explicit role-based bypasses and IP allowlisting for frontend access.

= Is it compatible with page caching systems? =

Yes. The plugin sends cache-busting headers and includes integrations for common WordPress caching workflows. If a cache plugin serves old public HTML, clear its cache after enabling or changing protection settings.

= Does it integrate with WooCommerce? =

WooCommerce-specific protection for products and product categories is available in the Pro extension. The free version provides site-wide password protection.

= What PHP version do I need? =

The plugin requires PHP 7.4 or higher. For best performance and security, a PHP 8.3+ environment (the version currently recommended by WordPress core) is preferred.

= Does the plugin send data to a remote service? =

No visitor or password data leaves your site. The plugin uses the Freemius SDK for optional opt-in usage data, licensing, and upgrades; see the External services section for exactly when it contacts Freemius and what it sends. Pro can use Google reCAPTCHA when an administrator configures and enables it.

= What happens on uninstall? =

Deleting the plugin from the Plugins screen removes its settings from the WordPress database. Deactivating the plugin keeps your settings.

== Screenshots ==

1. Overview: the current site protection status and the main password gate settings.
2. Cookie settings: choose session access or set how many days visitors stay authenticated.
3. Form personalization: customize the logo, colors, labels, button text, and error message.
4. Frontend lock screen: the branded password screen visitors see before protected content.
5. Status widget: check the site lock status from the WordPress dashboard.

== Development ==

The complete, human-readable source of the generated JavaScript and CSS in `assets/build/` is available on GitHub: [https://github.com/Dobrzepostawieni/primeplaced-advanced-password-protection](https://github.com/Dobrzepostawieni/primeplaced-advanced-password-protection)

The files in `assets/build/` are built from `assets/src/` with `@wordpress/scripts`. To rebuild them, clone the repository and run `npm ci` and then `npm run build` with Node.js 20 or newer. All PHP files in the plugin are shipped unminified.

== External services ==

This plugin uses the [Freemius](https://freemius.com/) SDK, a service provided by Freemius, Inc., for opt-in usage diagnostics, account and license management, and the optional upgrade flow. Site passwords and visitor data are never sent to Freemius.

The plugin contacts Freemius (`api.freemius.com`, `wp.freemius.com`, `checkout.freemius.com`) only in these cases:

* **After an administrator opts in** on the plugin's welcome screen: the administrator's name and email address; the site's homepage URL and title, WordPress and PHP versions, and site language; the plugin and SDK versions and whether the plugin is active, deactivated, or uninstalled. If the administrator also allows it, the names, slugs, versions, and active status of installed plugins and themes are sent. Opting in is optional, and the administrator can skip it or change permissions later from the plugin's Account page.
* **When an administrator submits deactivation feedback**: the selected reason and any text entered.
* **When an administrator opens the Pricing page or starts checkout**: plan and pricing data are loaded from Freemius, and the information entered during checkout is sent to Freemius to process the purchase.

If the administrator does not opt in and does not use these screens, no data is sent to Freemius.

Freemius terms of service: https://freemius.com/terms/
Freemius privacy policy: https://freemius.com/privacy/

**Google reCAPTCHA (Pro only)** is used only when a site administrator configures and enables the Pro reCAPTCHA module on password forms. Depending on the configured version, Google may receive information such as the visitor's IP address and browser/device data.

Google terms of service: https://policies.google.com/terms
Google privacy policy: https://policies.google.com/privacy

== Privacy ==

PrimePlaced - Password Protect Site & Staging stores its settings locally in your WordPress database and sets one functional cookie for authorized visitors.

Core data stored by the plugin may include:

* Plugin settings, including the encrypted site password and lock screen customization.
* A functional cookie in the visitor's browser holding the temporary authentication token. It lasts for the current browser session or for the number of days selected by the administrator.
* Short-lived counters used to throttle repeated password attempts. They are keyed by a hash derived from the visitor's IP address; the raw IP address is not stored.

Core data intentionally excludes:

* Visitor accounts, names, or email addresses.
* Activity logs of visitor access.

If the Pro activity log is enabled, the IP address, browser User-Agent string, timestamp, and result (successful, failed, or blocked) of authentication attempts are stored in a dedicated table in your own WordPress database.

== Changelog ==

= 1.0.3 =
* Renamed the plugin to PrimePlaced - Password Protect Site & Staging and its admin menu to Password Protect. Settings and active protection are not affected.
* Updated the Freemius SDK to 2.13.5.

= 1.0.2 =
* Fixed a settings update error caused by a legacy data key left over from earlier versions, which could block saving settings after upgrading.
* Fixed an issue where saving unrelated settings could unintentionally overwrite or re-encrypt an already saved password.
* Improved settings update handling to ignore unrecognized fields instead of rejecting the entire request.
* Added LiteSpeed Page Optimization compatibility so the lock-screen configuration and script are not transformed by JavaScript optimization.
* Reduced the lock-screen JavaScript payload by removing unneeded WordPress admin dependencies.

= 1.0.1 =
* Fixed global protection bypasses in WordPress REST responses and returned the correct authorization status for protected feeds.
* Protected sensitive settings by redacting saved passwords and session salts from standard REST responses while preserving an explicit, permission-protected password preview for authorized administrators.
* Strengthened password security with authenticated encryption, tamper detection, stricter settings validation, and race-safe throttling of parallel login attempts.
* Prevented authenticated protected pages from being stored as public cache entries and improved cache invalidation for LiteSpeed Cache and W3 Total Cache.
* Improved multisite activation, deactivation, and uninstall handling for networks with more than 100 sites, including cleanup of rate-limit data.
* Improved lock-screen and administrator accessibility with semantic landmarks, accessible color contrast, named mobile tabs, and reliable keyboard focus inside password modals.
* Corrected the password modal copy so adding a password does not incorrectly imply that site protection will be enabled automatically.

= 1.0.0 =
* Initial release.

== Upgrade Notice ==

= 1.0.3 =
The plugin is now called PrimePlaced - Password Protect Site & Staging and its admin menu is Password Protect. Your settings stay as they are.

= 1.0.2 =
Improves LiteSpeed compatibility, lock-screen performance, and settings reliability. Update recommended.

= 1.0.1 =
Security, protection and accessibility improvements. Update recommended.

= 1.0.0 =
Initial production release.
