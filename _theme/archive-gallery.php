<?php get_header(); ?>

	<main role="main">
		<?php if (have_posts()): while (have_posts()) : the_post();
			?><!-- article --><article id="<?php the_ID(); ?>" data-slug="<?php echo $post->post_name; ?>" data-menu-order="<?php echo $post->menu_order; ?>" <?php post_class(); ?> <?php echo ch_margins()->style; ?>>
				<?php if (!ch_is_teaser()): ?>
				<!-- post title -->
				<h2>
					<a href="<?php the_permalink(); ?>"><?php the_title(); ?></a>
				</h2>
				<!-- /post title -->
				<?php else: ?>
					<div class="content"><?php the_content(); ?></div>
				<?php endif; ?>

				<?php edit_post_link(); ?>

				<?php if (!ch_is_teaser()): ?>
				<!-- post thumbnail -->
					<a class="thumb" href="<?php the_permalink(); ?>"><?php echo ch_thumb(); ?></a>
				<!-- /post thumbnail -->
				<?php endif; ?>
			</article><!-- /article --><?php
		endwhile; endif; ?>
	</main>

	<div id="info">
		<section class="contact" style="display:none;"><?php echo ch_get_content( 11 ); ?></section>
	</div>

	<div id="gallery"></div>

<?php get_footer(); ?>
