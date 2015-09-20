<?php
// Define all user shortcode
function heib_get_user(){
	return wp_get_current_user();
}
//////////////////// username ///////////////////////////
/* 
	return username
*/
HEIBShortcode::add_shortcode('username', function(){
	$user = heib_get_user();

	return $user->display_name;	
}, 'user');
//////////////////// username ///////////////////////////

//////////////////// user_avatar ///////////////////////////
/* 
	return user's avatar
*/
HEIBShortcode::add_shortcode('user_avatar', function(){
	$user = heib_get_user();
	return get_avatar($user->ID, 80);
}, 'user');
//////////////////// user_avatar ///////////////////////////

//////////////////// user_link ///////////////////////////
/* 
	return user display link
*/
HEIBShortcode::add_shortcode('user_link', function(){
	$user = heib_get_user();
	return '<a href="' . get_author_posts_url($user->ID) . '">' . $user->display_name . '</a>';
}, 'user');
//////////////////// user_link ///////////////////////////

//////////////////// user_url ///////////////////////////
/* 
	return user display link
*/
HEIBShortcode::add_shortcode('user_url', function(){
	$user = heib_get_user();
	return get_author_posts_url($user->ID);
}, 'user');
//////////////////// user_url ///////////////////////////

//////////////////// user_recent_posts ///////////////////////////
/* 
	return user recent posts
*/
HEIBShortcode::add_shortcode('user_recent_posts', function(){
	$user = heib_get_user();
	$authors_posts = get_posts( array( 'author' => $user->ID, 'posts_per_page' => 3 ) );
	$output = '<ul>';
  foreach ( $authors_posts as $authors_post ) {
    $output .= '<li><a href="' . get_permalink( $authors_post->ID ) . '">' 
    					. apply_filters( 'the_title', $authors_post->post_title, $authors_post->ID ) . '</a></li>';
  }
  $output .= '</ul>';
  return $output;
}, 'user');
//////////////////// user_recent_posts ///////////////////////////
