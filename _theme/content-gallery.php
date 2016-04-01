<?php if (have_posts()): while (have_posts()) : the_post(); ?>

	<!-- article -->
	<article id="post-<?php the_ID(); ?>" <?php post_class(); ?> data-slug="<?php echo $post->post_name; ?>">

		<!-- gallery title -->
		<h1>
			<a href="<?php the_permalink(); ?>"><?php the_title(); ?></a>
		</h1>
		<!-- /gallery title -->

		<?php edit_post_link(); // Always handy to have Edit Post Links available ?>

		<!-- images -->
		<div class="images">
		<?php foreach (hue_gallery_ids() as $att_id): ?>
			<div class="img" id="<?php echo $att_id; ?>"><?php echo wp_get_attachment_image( $att_id, 'gallery' ) ?></div>
		<?php endforeach; ?>
			<nav class="nav"><a href="." class="prev"></a><a href="." class="next"></a></nav>
		</div>
		<!-- /images -->
		<div class="info"><span class="counter"></span> <span class="title"><?php the_title(); ?></span></div>
		<div class="backlink">
         <a  href="/">(go back)</a>
      </div>
		<div class="loadanim"></div>
	</article>
	<!-- /article -->

<?php endwhile; ?>
<?php endif; ?>
