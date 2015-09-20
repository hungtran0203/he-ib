<?php
// Define all endpoint

//////////////////// Start Boxes Endpoints ///////////////////////////
/* 
	set boxes endpoint
*/
add_filter('heib_process_endpoint__boxes.set', function($res){
		//sanity box data
	$query = $res->query();
	if(!isset($query['value'])){
		$res->error = 2;
		$res->errMsg = 'No data provided';
	} else {
		$boxes = $query['value'];
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
		$content = do_shortcode($shortcode);
		$res->data = $content;
	}
	return $res;	
});

/* 
	get shortcode list endpoint
*/
add_filter('heib_process_endpoint__shortcodes.get', function($res){
	$query = $res->query();
	$boxType = 'user';
	$shortcodes = HEIBShortcode::getBoxShortcodes($boxType);

	$shortcodes = array_map(function($s){
		$obj = new stdClass();
		$obj->title = $s;
		$obj->value = '[' . $s . ']';
		return $obj;
	}, $shortcodes);
	$res->data = $shortcodes;
	return $res;	
});
//////////////////// End Shortcode Endpoints ///////////////////////
