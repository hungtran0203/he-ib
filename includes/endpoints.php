<?php
// Define all endpoint

/* 
	return post permanklink structure
*/
add_filter('heib__get_permalink.post', function($permalink){
	return home_url(get_option('permalink_structure'));
});

/* 
	return user permanklink structure
*/
add_filter('heib__get_permalink.user', function($permalink){
	global $wp_rewrite;
	return home_url($wp_rewrite->get_author_permastruct());
});

/* 
	return category permanklink structure
*/
add_filter('heib__get_permalink.category', function($permalink){
	global $wp_rewrite;
	$term = get_term(1, 'category');
	$taxonomy = $term->taxonomy;
	$termlink = $wp_rewrite->get_extra_permastruct($taxonomy);
	return home_url($termlink);
});


//////////////////// Start Boxes Endpoints ///////////////////////////
/* 
	batch endpoint
*/
add_filter('heib_process_endpoint__batch', function($res){
		//sanity box data
	$query = $res->query();
	if(!isset($query['batch'])){
		$res->error = 2;
		$res->errMsg = 'No data provided';
	} else {
		$batchData = $query['batch'];
		if(!is_array($batchData)){
			$res->error = 2;
			$res->errMsg = 'Invalid batch query';
		} else {
			$data = array_map(function($batch) use($query){
				$batchQuery = array_merge($query, $batch);
				$res = new HEIBResponse($batchQuery);
				$res = HEIBApp::processEndpoint($res);
				return $res->toObject();
			}, $batchData);
			$res->data = $data;
		}
	}
	return $res;

});

/* 
	get box pattern
*/
add_filter('heib_process_endpoint__box.permalinks.get', function($res){
	$permalinks = new stdClass();
	$boxLab = get_option('heib_boxes_data');
	if(isset($boxLab['boxes']) && is_array($boxLab['boxes'])){
		foreach($boxLab['boxes'] as $box){
			if(!isset($box['published']) || $box['published']){
				if(isset($box['name'])){
					$permalink = apply_filters('heib__get_permalink.' . $box['name'], '');
					$permalinks->$box['name'] = $permalink;	
				}
			}
		}
	}

	//config for permalink
	//home link
	$config = array();
	$config['home'] = home_url('');

	//black list
	$blacklist = get_option('heib_blacklist_urls');
	$blacklist = $blacklist?$blacklist:'';
	$config['blacklist'] = $blacklist;

	$permalinks->config = $config;

	$res->data = $permalinks;
	return $res;
});

/* 
	set boxes endpoint
*/
add_filter('heib_process_endpoint__boxes.set', function($res){
	//check for permission
	if(current_user_can('publish_pages')){
		//sanity box data
		$query = $res->query();
		$boxes = isset($query['value'])?$query['value']:array();
		$boxes = heib_sanitize_lab($boxes);
		update_option('heib_boxes_data', $boxes);		
	}
	return $res;

});

/* 
	get boxes endpoint
*/
add_filter('heib_process_endpoint__boxes.get', function($res){
	$res->data = get_option('heib_boxes_data');
	return $res;
});

/* 
	verify a link
*/
add_filter('heib_process_endpoint__verifyLink.get', function($res){
	do_action('heib_verifyLink', $res);
	return $res;
});
//////////////////// End Boxes Endpoints ///////////////////////////


//////////////////// Start Shortcode Endpoints /////////////////////
/* 
	get shortcode content endpoint
*/
add_filter('heib_process_endpoint__shortcode.get', function($res){
	global $shortcode_tags;
	$query = $res->query();
	if(!isset($query['shortcode'])){
		$res->error = 3;
		$res->errMsg = 'No shortcode provided';
	} else {
		$shortcode = $query['shortcode'];

		$content = do_shortcode(stripslashes($shortcode));

		$res->data = $content;
	}
	return $res;	
});

/* 
	get shortcode list endpoint
*/
add_filter('heib_process_endpoint__shortcodes.get', function($res){
	$query = $res->query();
	$boxType = $query['type']?$query['type']:'';
	$shortcodes = HEIBShortcode::getBoxShortcodes($boxType);

	$shortcodes = array_map(function($s){
		$obj = new stdClass();
		$obj->title = $s['name'];
		$obj->value = $s['name'];
		$obj->atts = $s['atts'];
		$obj->hints = $s['hints'];
		return $obj;
	}, $shortcodes);
	$res->data = $shortcodes;
	return $res;	
});
//////////////////// End Shortcode Endpoints ///////////////////////
