<?php 
/*
	wrapper class for WordPress shortcode management
*/
class HEIBShortcode {
	public static $tagsByBoxType = array();
	public static $shortCodeStack = array();
	/*
		wrapper for WordPress add_shortcode function, do additional process like associate shortcode tag to box type
	*/
	public static function add_shortcode($tag, $fn, $boxType = null, $defAtts = array(), $hints = array()){
		//keep a list of shortcode associated with a domain, for listing purpose
		if(!is_null($boxType) && $boxType !== ''){
			HEIBShortcode::$tagsByBoxType[$boxType] = is_array(HEIBShortcode::$tagsByBoxType[$boxType])?HEIBShortcode::$tagsByBoxType[$boxType]:array();
			HEIBShortcode::$tagsByBoxType[$boxType][] = $tag;//array('atts' => $defAtts);
		}
		//setup HEIBShortcodeHandler object
		$handler = new HEIBShortcodeHandler($tag, $fn, $boxType, $defAtts, $hints);
		add_shortcode($tag, array($handler, 'do_shortcode'));
	}

	/*
		set current executing shortcode
	*/
	public static function setCurrentShortCode($tag){
		array_push(HEIBShortcode::$shortCodeStack, $tag);
	}

	/*
		get current executing shortcode
	*/
	public static function getCurrentShortCode(){
		if(count(HEIBShortcode::$shortCodeStack) > 0){
			return end(HEIBShortcode::$shortCodeStack);
		} else {
			return null;
		}
	}

	/*
		finish current executing shortcode
	*/
	public static function popCurrentShortCode(){
		if(count(HEIBShortcode::$shortCodeStack) > 0){
			array_pop(HEIBShortcode::$shortCodeStack);
		}
	}

	/*
		get the current shortcode attributes by merging user define attributes with default attributes
	*/
	public static function get_atts($atts){
		$currentShortcode = HEIBShortcode::getCurrentShortCode();
		if(!is_null($currentShortcode)){
			$defAtts = $currentShortcode->get_atts();
			$res = shortcode_atts($defAtts, $atts);
		} else {
			$res = $atts;
		}
		return $res;
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

class HEIBShortcodeHandler {
	protected $boxType = null;
	protected $fn = null;
	protected $atts = array();
	protected $hints = array();
	function __construct($tag, $fn, $boxType,  $atts = array(), $hints = array()){
		$this->tag = $tag;
		$this->fn = $fn;
		$this->boxType = $boxType;
		$this->atts = $atts;
		$this->hints = $hints;
	}

	/*
		shortcode handler function
	*/
	public function do_shortcode($att, $content, $tag){
		HEIBShortcode::setCurrentShortCode($this);
		$content = call_user_func_array($this->fn, array($att, $content, $tag));
		HEIBShortcode::popCurrentShortCode();
		return $content;
	}

	public function get_atts(){
		return $this->atts;
	}
}