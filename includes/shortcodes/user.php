<?php
// Define all user shortcode
function heib_get_user(){
	global $heib__Response;
	if(!is_null($heib__Response) && is_a($heib__Response, 'HEIBResponse') ){
		$query = $heib__Response->query();
		return wp_get_current_user();
	} else {
		return wp_get_current_user();
	}
}
//////////////////// username ///////////////////////////
/* 
	return username
*/
HEIBShortcode::add_shortcode('username', function($attr){
	$user = heib_get_user();
	return $user->display_name;	
}, 'user');
//////////////////// username ///////////////////////////

//////////////////// user_avatar ///////////////////////////
/* 
	return user's avatar
*/
HEIBShortcode::add_shortcode('user_avatar', function($attr){
	//setup default atts
	$atts = shortcode_atts(
					array('size' => 80)
					, $attr);
	$user = heib_get_user();
	return get_avatar($user->ID, $atts['size']);
}, 'user');
//////////////////// user_avatar ///////////////////////////

//////////////////// user_link ///////////////////////////
/* 
	return user display link
*/
HEIBShortcode::add_shortcode('user_link', function($attr){
	$user = heib_get_user();

	$atts = shortcode_atts(
					array('length' => null, 'ending' => ' ...')
					, $attr);
	$displayName = $user->display_name;

	if(!is_null($atts['length'])){
		$displayName = heib_truncate($displayName, $atts['length'], array('ending'=>$atts['ending']));
	}
	
	return '<a href="' . get_author_posts_url($user->ID) . '">' . $displayName . '</a>';
}, 'user');
//////////////////// user_link ///////////////////////////

//////////////////// user_url ///////////////////////////
/* 
	return user display link
*/
HEIBShortcode::add_shortcode('user_url', function($attr){
	$user = heib_get_user();
	return get_author_posts_url($user->ID);
}, 'user');
//////////////////// user_url ///////////////////////////

//////////////////// user_recent_posts ///////////////////////////
/* 
	return user recent posts
*/
HEIBShortcode::add_shortcode('user_recent_posts', function($attr){
	//setup default atts
	$atts = shortcode_atts(
					array('count' => 3)
					, $attr);

	$user = heib_get_user();
	$authors_posts = get_posts( array( 'author' => $user->ID, 'posts_per_page' => $atts['count'] ) );
	$output = '<ul>';
  foreach ( $authors_posts as $authors_post ) {
    $output .= '<li><a href="' . get_permalink( $authors_post->ID ) . '">' 
    					. apply_filters( 'the_title', $authors_post->post_title, $authors_post->ID ) . '</a></li>';
  }
  $output .= '</ul>';
  return $output;
}, 'user');
//////////////////// user_recent_posts ///////////////////////////
