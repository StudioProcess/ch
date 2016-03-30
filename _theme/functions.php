<?php
/*
 *  Author: Todd Motto | @toddmotto
 *  URL: html5blank.com | @html5blank
 *  Custom functions, support, custom post types and more.
 */

/*------------------------------------*\
	External Modules/Files
\*------------------------------------*/

// Load any external files you have here
include 'debug.php';

/*------------------------------------*\
	Theme Support
\*------------------------------------*/

if (!isset($content_width))
{
	$content_width = 900;
}

if (function_exists('add_theme_support'))
{
	// Add Menu Support
	add_theme_support('menus');

	// Add Thumbnail Theme Support
	add_theme_support('post-thumbnails');
	add_image_size('thumb-250', 0, 250, false);
	add_image_size('thumb-500', 0, 500, false);
	add_image_size('gallery', 0, 756, false);

	// Enables post and comment RSS feed links to head
	add_theme_support('automatic-feed-links');
}

// remove standard image sizes (except thumbnail);
add_filter('intermediate_image_sizes_advanced', 'filter_image_sizes');
function filter_image_sizes( $sizes) {
	//unset( $sizes['thumbnail']);
	unset( $sizes['small'] );
	unset( $sizes['medium'] );
	unset( $sizes['large']) ;
	return $sizes;
}


/*------------------------------------*\
	Functions
\*------------------------------------*/

// HTML5 Blank navigation
function html5blank_nav()
{
	wp_nav_menu(
	array(
		'theme_location'  => 'header-menu',
		'menu'            => '',
		'container'       => 'div',
		'container_class' => 'menu-{menu slug}-container',
		'container_id'    => '',
		'menu_class'      => 'menu',
		'menu_id'         => '',
		'echo'            => true,
		'fallback_cb'     => 'wp_page_menu',
		'before'          => '',
		'after'           => '',
		'link_before'     => '',
		'link_after'      => '',
		'items_wrap'      => '<ul>%3$s</ul>',
		'depth'           => 0,
		'walker'          => ''
		)
	);
}

// Load HTML5 Blank scripts (header.php)
function html5blank_header_scripts()
{
	if ($GLOBALS['pagenow'] != 'wp-login.php' && !is_admin()) {

		wp_register_script('conditionizr', get_template_directory_uri() . '/_/js/lib/conditionizr-4.3.0.min.js', array(), '4.3.0'); // Conditionizr
		//wp_enqueue_script('conditionizr'); // Enqueue it!

		wp_register_script('modernizr', get_template_directory_uri() . '/_/js/lib/modernizr-2.7.1.min.js', array(), '2.7.1'); // Modernizr
		//wp_enqueue_script('modernizr'); // Enqueue it!

		wp_register_script('masonry', get_template_directory_uri() . '/_/js/lib/masonry.pkgd.min.js', array('jquery'), '3.1.5');

		wp_register_script('cycle2', get_template_directory_uri() . '/_/js/lib/jquery.cycle2.min.js', array('jquery'), '2.1.5');

		wp_register_script('history', get_template_directory_uri() . '/_/js/lib/jquery.history.js', array('jquery'), '1.8b2');

		wp_register_script('html5blankscripts', get_template_directory_uri() . '/_/js/scripts.min.js', array('jquery', 'masonry', 'cycle2', 'history'), '1.0.0'); // Custom scripts
		wp_localize_script('html5blankscripts', 'AJAX', array( 'ajaxurl' => admin_url('admin-ajax.php') ));
		wp_enqueue_script('html5blankscripts'); // Enqueue it!

		//wp_enqueue_script('livereload', 'http://localhost:35729/livereload.js');
	}
}

// Load HTML5 Blank conditional scripts
function html5blank_conditional_scripts()
{
	if (is_page('pagenamehere')) {
		wp_register_script('scriptname', get_template_directory_uri() . '/js/scriptname.js', array('jquery'), '1.0.0'); // Conditional script(s)
		wp_enqueue_script('scriptname'); // Enqueue it!
	}
}

// Load HTML5 Blank styles
function html5blank_styles()
{
	wp_register_style('html5blank', get_template_directory_uri() . '/_/css/style.min.css', array(), '1.0', 'all');
	wp_enqueue_style('html5blank'); // Enqueue it!
}

// Register HTML5 Blank Navigation
function register_html5_menu()
{
	register_nav_menus(array( // Using array to specify more menus if needed
		'header-menu' => __('Header Menu', 'html5blank')
	));
}

// Remove the <div> surrounding the dynamic navigation to cleanup markup
function my_wp_nav_menu_args($args = '')
{
	$args['container'] = false;
	return $args;
}

// Remove Injected classes, ID's and Page ID's from Navigation <li> items
function my_css_attributes_filter($var)
{
	return is_array($var) ? array() : '';
}

// Remove invalid rel attribute values in the categorylist
function remove_category_rel_from_category_list($thelist)
{
	return str_replace('rel="category tag"', 'rel="tag"', $thelist);
}

// Add page slug to body class, love this - Credit: Starkers Wordpress Theme
function add_slug_to_body_class($classes)
{
	global $post;
	if (is_home()) {
		$key = array_search('blog', $classes);
		if ($key > -1) {
			unset($classes[$key]);
		}
	} elseif (is_page()) {
		$classes[] = sanitize_html_class($post->post_name);
	} elseif (is_singular()) {
		$classes[] = sanitize_html_class($post->post_name);
	}

	return $classes;
}


// Remove wp_head() injected Recent Comment styles
function my_remove_recent_comments_style()
{
	global $wp_widget_factory;
	remove_action('wp_head', array(
		$wp_widget_factory->widgets['WP_Widget_Recent_Comments'],
		'recent_comments_style'
	));
}

// Pagination for paged posts, Page 1, Page 2, Page 3, with Next and Previous Links, No plugin
function html5wp_pagination()
{
	global $wp_query;
	$big = 999999999;
	echo paginate_links(array(
		'base' => str_replace($big, '%#%', get_pagenum_link($big)),
		'format' => '?paged=%#%',
		'current' => max(1, get_query_var('paged')),
		'total' => $wp_query->max_num_pages
	));
}

// Custom Excerpts
function html5wp_index($length) // Create 20 Word Callback for Index page Excerpts, call using html5wp_excerpt('html5wp_index');
{
	return 20;
}

// Create 40 Word Callback for Custom Post Excerpts, call using html5wp_excerpt('html5wp_custom_post');
function html5wp_custom_post($length)
{
	return 40;
}

// Create the Custom Excerpts callback
function html5wp_excerpt($length_callback = '', $more_callback = '')
{
	global $post;
	if (function_exists($length_callback)) {
		add_filter('excerpt_length', $length_callback);
	}
	if (function_exists($more_callback)) {
		add_filter('excerpt_more', $more_callback);
	}
	$output = get_the_excerpt();
	$output = apply_filters('wptexturize', $output);
	$output = apply_filters('convert_chars', $output);
	$output = '<p>' . $output . '</p>';
	echo $output;
}

// Custom View Article link to Post
function html5_blank_view_article($more)
{
	global $post;
	return '... <a class="view-article" href="' . get_permalink($post->ID) . '">' . __('View Article', 'html5blank') . '</a>';
}

// Remove Admin bar
function remove_admin_bar()
{
	return false;
}

// Remove 'text/css' from our enqueued stylesheet
function html5_style_remove($tag)
{
	return preg_replace('~\s+type=["\'][^"\']++["\']~', '', $tag);
}

// Remove thumbnail width and height dimensions that prevent fluid images in the_thumbnail
function remove_thumbnail_dimensions( $html )
{
	$html = preg_replace('/(width|height)=\"\d*\"\s/', "", $html);
	return $html;
}

// Custom Gravatar in Settings > Discussion
function html5blankgravatar ($avatar_defaults)
{
	$myavatar = get_template_directory_uri() . '/img/gravatar.jpg';
	$avatar_defaults[$myavatar] = "Custom Gravatar";
	return $avatar_defaults;
}

/*------------------------------------*\
	Actions + Filters + ShortCodes
\*------------------------------------*/

// Add Actions
add_action('init', 'html5blank_header_scripts'); // Add Custom Scripts to wp_head
add_action('wp_print_scripts', 'html5blank_conditional_scripts'); // Add Conditional Page Scripts
add_action('wp_enqueue_scripts', 'html5blank_styles'); // Add Theme Stylesheet
add_action('init', 'register_html5_menu'); // Add HTML5 Blank Menu
//add_action('init', 'create_post_type_html5'); // Add our HTML5 Blank Custom Post Type
add_action('widgets_init', 'my_remove_recent_comments_style'); // Remove inline Recent Comment Styles from wp_head()
add_action('init', 'html5wp_pagination'); // Add our HTML5 Pagination

// Remove Actions
remove_action('wp_head', 'feed_links_extra', 3); // Display the links to the extra feeds such as category feeds
remove_action('wp_head', 'feed_links', 2); // Display the links to the general feeds: Post and Comment Feed
remove_action('wp_head', 'rsd_link'); // Display the link to the Really Simple Discovery service endpoint, EditURI link
remove_action('wp_head', 'wlwmanifest_link'); // Display the link to the Windows Live Writer manifest file.
remove_action('wp_head', 'index_rel_link'); // Index link
remove_action('wp_head', 'parent_post_rel_link', 10, 0); // Prev link
remove_action('wp_head', 'start_post_rel_link', 10, 0); // Start link
remove_action('wp_head', 'adjacent_posts_rel_link', 10, 0); // Display relational links for the posts adjacent to the current post.
remove_action('wp_head', 'wp_generator'); // Display the XHTML generator that is generated on the wp_head hook, WP version
remove_action('wp_head', 'adjacent_posts_rel_link_wp_head', 10, 0);
remove_action('wp_head', 'rel_canonical');
remove_action('wp_head', 'wp_shortlink_wp_head', 10, 0);

// Add Filters
add_filter('avatar_defaults', 'html5blankgravatar'); // Custom Gravatar in Settings > Discussion
add_filter('body_class', 'add_slug_to_body_class'); // Add slug to body class (Starkers build)
add_filter('widget_text', 'do_shortcode'); // Allow shortcodes in Dynamic Sidebar
add_filter('widget_text', 'shortcode_unautop'); // Remove <p> tags in Dynamic Sidebars (better!)
add_filter('wp_nav_menu_args', 'my_wp_nav_menu_args'); // Remove surrounding <div> from WP Navigation
// add_filter('nav_menu_css_class', 'my_css_attributes_filter', 100, 1); // Remove Navigation <li> injected classes (Commented out by default)
// add_filter('nav_menu_item_id', 'my_css_attributes_filter', 100, 1); // Remove Navigation <li> injected ID (Commented out by default)
// add_filter('page_css_class', 'my_css_attributes_filter', 100, 1); // Remove Navigation <li> Page ID's (Commented out by default)
add_filter('the_category', 'remove_category_rel_from_category_list'); // Remove invalid rel attribute
add_filter('the_excerpt', 'shortcode_unautop'); // Remove auto <p> tags in Excerpt (Manual Excerpts only)
add_filter('the_excerpt', 'do_shortcode'); // Allows Shortcodes to be executed in Excerpt (Manual Excerpts only)
add_filter('excerpt_more', 'html5_blank_view_article'); // Add 'View Article' button instead of [...] for Excerpts
add_filter('show_admin_bar', 'remove_admin_bar'); // Remove Admin bar
add_filter('style_loader_tag', 'html5_style_remove'); // Remove 'text/css' from enqueued stylesheet
add_filter('post_thumbnail_html', 'remove_thumbnail_dimensions', 10); // Remove width and height dynamic attributes to thumbnails
add_filter('image_send_to_editor', 'remove_thumbnail_dimensions', 10); // Remove width and height dynamic attributes to post images

// Remove Filters
remove_filter('the_excerpt', 'wpautop'); // Remove <p> tags from Excerpt altogether

// Shortcodes
add_shortcode('html5_shortcode_demo', 'html5_shortcode_demo'); // You can place [html5_shortcode_demo] in Pages, Posts now.
add_shortcode('html5_shortcode_demo_2', 'html5_shortcode_demo_2'); // Place [html5_shortcode_demo_2] in Pages, Posts now.

// Shortcodes above would be nested like this -
// [html5_shortcode_demo] [html5_shortcode_demo_2] Here's the page title! [/html5_shortcode_demo_2] [/html5_shortcode_demo]


/*------------------------------------*\
	ShortCode Functions
\*------------------------------------*/

// Shortcode Demo with Nested Capability
function html5_shortcode_demo($atts, $content = null)
{
	return '<div class="shortcode-demo">' . do_shortcode($content) . '</div>'; // do_shortcode allows for nested Shortcodes
}

// Shortcode Demo with simple <h2> tag
function html5_shortcode_demo_2($atts, $content = null) // Demo Heading H2 shortcode, allows for nesting within above element. Fully expandable.
{
	return '<h2>' . $content . '</h2>';
}

/*------------------------------------*\
	Thumbnails
\*------------------------------------*/
function ch_str2px($str) {
	return intval( trim(preg_replace('/\h*px\h*/i', '', $str)) );
}

function ch_thumb() {
	$height = ch_str2px(types_render_field('height-override', array()));
	if ($height == 0) {
		$height = ch_str2px(types_render_field('height', array()));
	}
	if ($height == 0) $height = 250; // default
	$width = $height;
	$id = get_post_thumbnail_id();
	if ( has_post_thumbnail() ) {
		$img = wp_get_attachment_image_src( $id, 'full' );
		//print_r($img);
		$width = floor($img[1]/$img[2] * $height);
		//echo($id . "x" . $width);
	}
	//return get_the_post_thumbnail( get_the_ID(), array($width, $height), array('class' => 'height-'.$height) );
	return wp_get_attachment_image( $id, array($width, $height), false, array('class' => 'height-'.$height, 'style' => "width:{$width}px;height:{$height}px;", 'alt' => '') );
}

/*------------------------------------*\
	Content Pages
\*------------------------------------*/
// get post or page content by id
function ch_get_content( $id, $title = true ) {
	$post = get_page($id);
	if ($title) $out .= "<h2>$post->post_title</h2>";
	$out .= apply_filters('the_content', $post->post_content);
	return $out;
}

/*------------------------------------*\
	Teaser Injection
\*------------------------------------*/
$ch_teaser_fallpack_pos = 3; // 0-based
$ch_teaser_id = 194;

/* show teaser in galleries (frontend & admin) */
add_filter('the_posts', 'ch_inject_teaser', 10, 2);
function ch_inject_teaser( $posts, $q ) {
	if ( $q->is_main_query() && ($q->is_post_type_archive('gallery') || $q->is_category()) || $q->is_post_type_archive('christina')) {
		// skip admin trash, drafs
		$status = $q->get('post_status');
		if ( is_admin() && ($status == 'trash' || $status == 'draft') )
			return $posts; // don't show in trash, drafts etc.
      // hlog($posts);

		global $ch_teaser_id, $ch_teaser_fallpack_pos;
		$teaser = get_post($ch_teaser_id);
		$pos = $teaser->menu_order;
      // hlog($pos);
		if (!$pos) $pos = $ch_teaser_fallpack_pos;
		array_splice( $posts, $pos, 0, array($teaser) ); // inject
	}
	return $posts;
}

/* don't show teaser in pages anymore */
// leave it enabled, disable page reordering instead
// add_filter( 'parse_query', 'ch_exclude_teaser_from_pages' );
// function ch_exclude_teaser_from_pages($q) {
// 	global $ch_teaser_id;
// 	if ( is_admin() && $q->get('post_type') == 'page') {
// 		$q->set( 'post__not_in', array($ch_teaser_id) );
// 	}
// 	return $q;
// }



function ch_is_teaser() {
	global $ch_teaser_id;
	return (get_the_ID() == $ch_teaser_id);
}

add_filter('post_class', 'ch_teaser_class');
function ch_teaser_class( $classes ) {
	if ( ch_is_teaser() ) $classes[] = 'teaser';
	return $classes;
}

/*------------------------------------*\
	AJAX (Gallery Content)
\*------------------------------------*/
add_action('wp_ajax_get', 'ch_ajax_get');
add_action('wp_ajax_nopriv_get', 'ch_ajax_get');
function ch_ajax_get() {
	//global $wpdb; // this is how you get access to the database
	// TODO: check nonce
	$id = $_GET['id'];

	if ($id == 'info') {
		get_template_part( 'content-about' );
		get_template_part( 'content-contact' );
		echo '<div class="loadanim"></div>'.PHP_EOL;
	} else {
		$id = intval( $id );
		// query_posts( 'post_type=gallery&p=' . $id );
      query_posts( array(
         'post_type' => array('gallery', 'christina'),
         'p' => $id
      ));
		get_template_part( 'content-gallery' );
	}
	die(); // this is required to return a proper result
}

/*------------------------------------*\
	URLS / PERMALINKS
\*------------------------------------*/

// match about and contact pages
// (they don't automatically, because post_type gallery slug is set to '/', I think)
add_rewrite_rule('^(about|contact)/?','index.php?pagename=$matches[1]','top');
// just needed on changes:
// flush_rewrite_rules();


add_rewrite_rule('^christina/([^/]+)/?','index.php?christina=$matches[1]','top');

// alter loop for custom front page
add_action("pre_get_posts", "ch_custom_front_page");
function ch_custom_front_page($wp_query) {
   if ( is_admin() ) return;
   if ( !$wp_query->is_main_query() ) return;

   // set front page to gallery archive in category home
   if ( $wp_query->is_front_page() ) {
      $wp_query->set( 'post_type', array('gallery') );
      $wp_query->set( 'category_name', 'home' );
      // // $wp_query->set('page_id', ''); // empty page id
      // // fix conditional fucntions like is_front_page or is_single ect
      $wp_query->is_front_page = 1;
      $wp_query->is_home = 1;
      $wp_query->is_archive = 1;
      $wp_query->is_post_type_archive = 1;
      // // $wp_query->is_page = 0;
      // // $wp_query->is_singular = 0;
   }

   // make single gallery sites work
   if ( $wp_query->is_single() && !isset($wp_query->query[post_type]) ) {
      $wp_query->set('post_type', array('gallery', 'page', 'christina'));
   }

   if ( $wp_query->is_archive() ) {
      $wp_query->set( 'orderby', 'menu_order' );
      $wp_query->set( 'order', 'ASC' );
   }
   // hlog($wp_query);
}



/*------------------------------------*\
	THUMBNAIL MARGINS
\*------------------------------------*/
ini_set ( 'suhosin.mt_srand.ignore' , 0 );

mt_srand(123);

function ch_margins($hmin=40, $hmax=120, $vmin=20, $vmax=100) {
	//global $wp_query;
	$h = mt_rand($hmin, $hmax) / 2.0;
	$v = mt_rand($vmin, $vmax) / 2.0;
	// $bottom = mt_rand($bmin, $bmax);
	// $left = mt_rand($rmin, $rmax);
	return (object)array(
		'h' => $h,
		'v' => $v,
		'style' => "style=\"margin:${h}px ${v}px;\""
	);
}


/*------------------------------------*\
	MISC
\*------------------------------------*/

// disable ... replacement (and others)
remove_filter( 'the_content', 'wptexturize' );

// fix title tag
add_filter( 'wp_title', 'ch_fix_title', 10, 2 );
function ch_fix_title($title, $sep) {
	if ( is_post_type_archive('gallery') ) {
		//if (is_category('home')) return '';
		return '';
	}
	return $title;
}

/*------------------------------------*\
	METADATA
\*------------------------------------*/

function ch_title($echo=true) {
	$title = trim( wp_title('', false) );
	$title = $title ? $title .= ' — ' : $title;
	$title .= get_bloginfo('description').' '.get_bloginfo('name');
	if ($echo) echo $title;
	return $title;
}


function ch_strip_links($subject) {
	return preg_replace( '/<a[^<]*<\/a>/i', '', $subject );
}

/* retrieve src of featured image py post_id. if $post_id is null, use current post in loop */
function ch_get_thumb_src($post_id, $size) {
	$img_id = get_post_thumbnail_id($post_id);
	$img_src = wp_get_attachment_image_src( $img_id, $size );
	if ($img_src) $img_src = $img_src[0];
	return $img_src;
}

function ch_teaser_text() {
	return wp_strip_all_tags( ch_strip_links(ch_get_content(194, false)) );
}

add_action('wp_head', 'ch_meta');
function ch_meta() { ?>
	<!-- METADATA -->
	<?php if ( is_singular('gallery') ) { // single gallery
		$url = get_the_permalink();
		$image = ch_get_thumb_src(null, array(1200,630));
		$title = trim( wp_title('', false) );
		$description = get_bloginfo('description').' '.get_bloginfo('name').'. '.ch_teaser_text();
	} else {
		$url = home_url('/'); // index or other
		//$image = ch_get_thumb_src( 6, array(1200,630) ); // about image
		$image = get_template_directory_uri() . '/_/img/www.christinahaeusler.at.jpg';
		$title = ch_title(false);
		$description = ch_teaser_text();
	}?>
		<meta property="og:title" content="<?php echo $title; ?>" />
		<meta property="og:type" content="website" />
		<meta property="og:url" content="<?php echo $url; ?>" />
		<meta property="og:image" content="<?php echo $image; ?>" />
		<meta property="og:description" content="<?php echo $description; ?>" />
		<meta property="twitter:card" content="summary" />
		<meta property="twitter:title" content="<?php echo $title; ?>" />
		<meta property="twitter:description" content="<?php echo $description; ?>" />
		<meta property="twitter:image" content="<?php echo $image; ?>" />
		<meta property="twitter:url" content="<?php echo $url; ?>" />
<?php
}


?>
