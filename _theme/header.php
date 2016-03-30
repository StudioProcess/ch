<!doctype html>
<html <?php language_attributes(); ?> class="no-js" itemscope itemtype="http://schema.org/ProfessionalService">
	<head>
		<meta charset="<?php bloginfo('charset'); ?>">
		<title><?php ch_title(); ?></title>

		<link href="//www.google-analytics.com" rel="dns-prefetch">
        <link href="<?php echo get_template_directory_uri(); ?>/_/img/icons/favicon.ico" rel="shortcut icon">
        <link href="<?php echo get_template_directory_uri(); ?>/_/img/icons/touch.png" rel="apple-touch-icon-precomposed">

		<meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
		<meta name="viewport" content="width=device-width, initial-scale=1.0">

		<meta itemprop="description" name="description" content="<?php echo ch_teaser_text(); ?>">
		<meta itemprop="name" name="name" content="<?php echo get_bloginfo('description').' '.get_bloginfo('name'); ?>">
		<meta itemprop="foundingDate" name="foundingDate" content="2001-04-01">
		<meta itemprop="legalName" name="legalName" content="<?php echo get_bloginfo('name'); ?>">

		<?php wp_head(); ?>

	</head>
	<body <?php body_class(); ?>>

		<!-- wrapper -->
		<div class="wrapper">

			<!-- header -->
			<header class="header clear" role="banner">

					<h2 class="tagline"><?php bloginfo( 'description' ); ?></h2>

					<!-- logo -->
					<h1 class="logo">
						<a itemprop="url" href="<?php echo home_url(); ?>"><?php bloginfo('name'); ?></a>
					</h1>
					<!-- /logo -->

					<!-- nav -->
					<nav class="nav" role="navigation">
						<?php html5blank_nav(); ?>
					</nav>
					<!-- /nav -->

			</header>
			<!-- /header -->
