<?php
// Define all user shortcode
function heib_get_post(){
	global $heib__Response;
	if(!is_null($heib__Response) && is_a($heib__Response, 'HEIBResponse') ){
		$query = $heib__Response->query();
		$contextUrl = isset($query['contextUrl'])?$query['contextUrl']:'';
		if($contextUrl !== ''){
			if($postId = url_to_postid($contextUrl)){
				$post = get_post($postId);
				return $post;
			}
		} else {			
			//no contextUrl is provide, return a random post a example
			$post = query_posts('orderby=rand&showposts=1');
			return $post?$post[0]:null;
		}
	}
	//no post found
	return null;

}
//////////////////// post_title ///////////////////////////
/* 
	return post's title
*/
HEIBShortcode::add_shortcode('post_title', function(){
	$post = heib_get_post();
	return $post?$post->post_title:'';	
}, 'post');
//////////////////// post_title ///////////////////////////

//////////////////// post_content ///////////////////////////
/* 
	return post's description
*/
HEIBShortcode::add_shortcode('post_content', function(){
	$post = heib_get_post();
	return $post?$post->post_content:'';
}, 'post');
//////////////////// post_content ///////////////////////////

//////////////////// post_comment_count ///////////////////////////
/* 
	return post comment count
*/
HEIBShortcode::add_shortcode('post_comment_count', function(){
	$post = heib_get_post();
	return $post?$post->comment_count:'';
}, 'post');
//////////////////// post_comment_count ///////////////////////////
