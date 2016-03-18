<?php get_header(); ?>

   <main role="main">

      <?php if ( !post_password_required(766) ) : ?>
         <?php get_template_part('content-gallery'); ?>
      <?php else:
         //show the password form of the protected page
         echo get_the_password_form(766);
      endif; ?>

   </main>

<?php get_footer(); ?>
