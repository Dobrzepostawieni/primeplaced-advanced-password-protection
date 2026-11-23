# PrimePlaced - Password Protect Site & Staging

Password protect your entire WordPress site (a staging site, a client preview
or a private site) with one password and a branded lock screen. Visitors need
no user account; access is remembered for the browser session or for the
number of days you choose.

This repository holds the human-readable source of the free plugin published
on WordPress.org:
https://wordpress.org/plugins/primeplaced-advanced-password-protection/

Each release matches the code in the plugin directory's SVN tag of the same
version. Install the plugin from WordPress.org; this repository is for reading
and rebuilding the code.

Plugin page: https://dobrzepostawieni.pl/advanced-password-protection

## Building the JavaScript and CSS

The compiled files in `assets/build/` are generated from `assets/src/` with
`@wordpress/scripts` (the admin, lock screen, dashboard widget and pricing
screens). All PHP files are shipped unminified.

Requirements: Node.js 20 or newer, npm 10 or newer.

```sh
npm ci
npm run build
```

## PHP dependencies

The Freemius SDK is shipped in the WordPress.org package in `vendor/`;
`composer.json` lists the PHP dependencies.

## License

GPL-3.0-or-later. See `LICENSE.txt`.
