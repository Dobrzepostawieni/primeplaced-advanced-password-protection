<?php
/**
 * Standalone Lock Screen Template.
 *
 * This file acts as a standalone HTML page.
 *
 * @package    PPADVP
 * @author     Dobrzepostawieni <contact@dobrzepostawieni.pl>
 * @copyright  2026 Dobrzepostawieni.pl
 * @license    GPL-3.0-or-later
 */

// Prevent direct file access.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

?>
<!DOCTYPE html>
<html <?php \language_attributes(); ?>>
<head>
	<meta charset="<?php echo \esc_attr( (string) $ppadvp_charset ); ?>">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<meta name="robots" content="noindex, nofollow">

	<title><?php echo \esc_html( $ppadvp_page_title ); ?></title>

	<?php \do_action( 'ppadvp_lock_screen_head' ); ?>
</head>
<body class="<?php echo \esc_attr( $ppadvp_body_classes ); ?>">

	<?php \do_action( 'ppadvp_lock_screen_body_open' ); ?>

	<div id="ppadvp-lock-screen-root">
		<noscript>
			<div style="padding: 20px; text-align: center; color: #333;">
				<?php \esc_html_e( 'JavaScript is required to view this content.', 'primeplaced-advanced-password-protection' ); ?>
			</div>
		</noscript>
	</div>

	<?php \do_action( 'ppadvp_lock_screen_footer' ); ?>

</body>
</html>