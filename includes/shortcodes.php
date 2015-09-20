<?php 
/*
	wrapper class for WordPress shortcode management
*/
class HEIBShortcode {
	public static $tagsByBoxType = array();

	/*
		wrapper for WordPress add_shortcode function, do additional process like associate shortcode tag to box type
	*/
	public static function add_shortcode($tag, $fn, $boxType = null){
		//keep a list of shortcode associated with a domain, for listing purpose
		if(!is_null($boxType) && $boxType !== ''){
			HEIBShortcode::$tagsByBoxType[$boxType] = is_array(HEIBShortcode::$tagsByBoxType[$boxType])?HEIBShortcode::$tagsByBoxType[$boxType]:array();
			HEIBShortcode::$tagsByBoxType[$boxType][] = $tag;
		}
		add_shortcode($tag, $fn);
	}

	/*
		wrapper for WordPress do_shortcode function
	*/
	public static function do_shortcode($content){
		//additional parameter assigment here
		return do_shortcode($content);
	}

	/*
		return list of shortcode associated to a box type
	*/
	public static function getBoxShortcodes($boxType){
		return isset(HEIBShortcode::$tagsByBoxType[$boxType])?HEIBShortcode::$tagsByBoxType[$boxType]:array();
	}

	/*
		initialize HEIBShortcode hooks
	*/
	public static function init(){
		$folder = dirname(__FILE__) . '/shortcodes';
		foreach (glob($folder . "/*.php") as $filename)
		{
			require_once($filename);
		}
	}

}