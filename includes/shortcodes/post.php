<?php
// Define all user shortcode
function heib_get_post(){
	global $heib__Response;
	if(!is_null($heib__Response) && is_a($heib__Response, 'HEIBResponse') ){
		$query = $heib__Response->query();
		$contextUrl = isset($query['contextUrl'])?$query['contextUrl']:'';
		$contextUrl = stripslashes($contextUrl);
		if($contextUrl !== ''){
			if($postId = url_to_postid($contextUrl)){
				$post = get_post($postId);

				//setup the current post
				setup_postdata( $GLOBALS['post'] =& $post );
				return $post;
			}
		} else {			
			//no contextUrl is provide, return a random post a example
			$post = query_posts('orderby=rand&showposts=1');
			if($post){
				//setup the current post
				setup_postdata( $GLOBALS['post'] =& $post[0] );
			}
			return $post?$post[0]:null;
		}
	}
	//no post found
	return null;
}

function heib_verifyPostLink($res){
	$query = $res->query();
	if(isset($query['type']) && $query['type'] === 'post'){
		$post = heib_get_post();
		if($post)	{
			$res->data = 1;
		}
	}
}

add_action('heib_verifyLink', 'heib_verifyPostLink');

//////////////////// post_title ///////////////////////////
/* 
	return post's title
*/
HEIBShortcode::add_shortcode('post_title', function($attr){
	$atts = shortcode_atts(
					array('length' => null, 'ending' => ' ...')
					, $attr);
	$post = heib_get_post();
	
	if($post && !is_null($atts['length']) && $atts['length'] > 0 ){
		$title = get_the_title();
		$title = heib_truncate($title, $atts['length'], array('ending'=>$atts['ending'], 'exact'=>false, 'html'=>true));
	} else {
		$title = '';
	}
	return $title;
}, 'post');
//////////////////// post_title ///////////////////////////

//////////////////// post_content ///////////////////////////
/* 
	return post's description
*/
HEIBShortcode::add_shortcode('post_content', function($attr){
	$atts = shortcode_atts(
					array('length' => 60, 'ending' => ' ...')
					, $attr);
	$post = heib_get_post();

	if($post){
		$content = apply_filters( 'the_content', get_the_content() );
		$content = str_replace( ']]>', ']]&gt;', $content );
		//truncate content
		$content = heib_truncate($content, $atts['length'], array('ending'=>$atts['ending'], 'exact'=>false, 'html'=>true));
		return $content;
	} else {
		return '';
	}
}, 'post');
//////////////////// post_content ///////////////////////////

//////////////////// post_comment_count ///////////////////////////
/* 
	return post comment count
*/
HEIBShortcode::add_shortcode('post_comment_count', function($attr){
	$atts = shortcode_atts(
					array('empty' => __('N/A'))
					, $attr);
	$post = heib_get_post();
	return $post?$post->comment_count:$atts['empty'];
}, 'post');
//////////////////// post_comment_count ///////////////////////////

//////////////////// post_link ///////////////////////////
/* 
	return post permalink
*/
HEIBShortcode::add_shortcode('post_link', function($attr){
	$post = heib_get_post();
	return $post?get_permalink():'';
}, 'post');
//////////////////// post_link ///////////////////////////

//////////////////// post_category_list ///////////////////////////
/* 
	return post category list 
*/
HEIBShortcode::add_shortcode('post_category_list', function($attr){
	$atts = shortcode_atts(
					array('separator' => null, 'parents' => '', 'empty' => __('N/A'))
					, $attr);
	$post = heib_get_post();

	$content = '';
	if($post){
		$content = __(get_the_category_list($atts['separator'], $atts['parents']));
	}
	return $content?$content:$atts['empty'];
}, 'post');
//////////////////// post_category_list ///////////////////////////

//////////////////// post_tag_list ///////////////////////////
/* 
	return post tag list 
*/
HEIBShortcode::add_shortcode('post_tag_list', function($attr){
	$atts = shortcode_atts(
					array('separator' => null, 'parents' => '', 'empty' => __('N/A'))
					, $attr);
	$post = heib_get_post();

	$content = '';
	if($post){
		$content = __(get_the_tag_list($atts['separator'], $atts['parents']));
	}
	return $content?$content:$atts['empty'];
	
}, 'post');
//////////////////// post_tag_list ///////////////////////////
