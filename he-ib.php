<?php
/*
Plugin Name: he-ib
Plugin URI: http://halo.ib/?return=true
Description: HaloEngine Informative Boxes plugin for WordPress
Version: 1.0.0
Author: HungTran
Author URI: http://halo.ib/wordpress-plugins/
License: GPLv2 or later
*/

/*
This program is free software; you can redistribute it and/or
modify it under the terms of the GNU General Public License
as published by the Free Software Foundation; either version 2
of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program; if not, write to the Free Software
Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
*/
defined( 'ABSPATH' ) || exit;

/** If you hardcode a WP.com API key here, all key config screens will be hidden */
class HEIBApp {
	private function __construct() { /* Do nothing here */ }

	/**
	 * Main HEIBApp Instance.
	 *
	 */
	public static function getInstance() {

		// Store the instance locally to avoid private static replication
		static $instance = null;

		// Only run these methods if they haven't been run previously
		if ( null === $instance ) {
			$instance = new HEIBApp;
			$instance->defineConstants();
			$instance->version();
			$instance->setupHooks();
			
		}

		// Always return the instance
		return $instance;
	}
	
	private function defineConstants(){
	
	}
	
	private function version(){
	
	}
	
	private function setupHooks(){
		if(is_admin()){
			$this->adminHooks();
		} else {
			$this->frontendHooks();
		}
		$this->apiHooks();
		$this->commonHooks();

		$this->shortcodeHooks();
		$this->ajaxHooks();
	}

	private function ajaxHooks(){

		add_action( 'wp_ajax_heib_ajax', 'HEIBApp::ajaxProcess' );
		add_action( 'wp_ajax_nopriv_heib_ajax', 'HEIBApp::ajaxProcess' );

		function prefix_ajax_add_foobar() {
			// Handle request then generate response using WP_Ajax_Response
		}
	}

	private function adminHooks(){
		//admin menu
		add_action('admin_menu', 'HEIBApp::admin_menu');
	
	}
	
	private function frontendHooks(){
		HEIBApp::frontend_enqueue_scripts();
	}

	private function apiHooks(){
		require_once(dirname(__FILE__) . '/includes/endpoints.php');
	}
	
	private function commonHooks(){
	
	}
	
	private function shortcodeHooks(){
		require_once(dirname(__FILE__) . '/includes/shortcodes.php');
		HEIBShortcode::init();
	}

	/****************************************** Define hook call back function ***************************************/
	public static function admin_menu(){
		$parent_slug = 'heib_dashboard';
		$handle = 'HEIBApp::getDashboardContent';
		//menu page
		$page = add_menu_page( 	'Informative Boxes',
						'Informative Boxes',
						//'manage_options',
						'publish_pages',
						$parent_slug,
						$handle,
						'',
						null );

		$designPage = add_submenu_page( $parent_slug, 
											'Box Design', 
											'Box Design', 
											'publish_pages',
											'heib_design', 
											'HEIBApp::getDesignContent' );
		add_action( 'admin_print_styles-' . $designPage, 'HEIBApp::admin_enqueue_styles' );
		add_action( 'admin_print_scripts-' . $designPage, 'HEIBApp::admin_enqueue_scripts' );
	
		//call register settings function
		add_action( 'admin_init', 'HEIBAPP::register_plugin_settings' );	
	}

	public static function admin_enqueue_styles(){
	
	}
	
	public static function admin_enqueue_scripts(){
		wp_enqueue_script( 'heibadmin', plugins_url( '/dist/backend.bundle.js' , __FILE__ ), array( 'jquery' ));
		wp_enqueue_script( 'heibadmin_config', plugins_url( '/assets/js/config.js' , __FILE__ ), array( 'heibadmin' ));
	}
	
	public static function frontend_enqueue_scripts(){
		add_action('wp_head',function(){
			echo '<script type="text/javascript"> var ajaxurl = "' . admin_url('admin-ajax.php') .'"</script>';
		});
		wp_enqueue_script( 'heibfrontend', plugins_url( '/dist/frontend.bundle.js' , __FILE__ ), array( 'jquery' ));
		wp_enqueue_script( 'heibfrontend_config', plugins_url( '/assets/js/config.js' , __FILE__ ), array( 'heibfrontend' ));
	}

	public static function admin_content(){
		if(isset($_REQUEST['view']) && $_REQUEST['view'] == 'design'){
			HEIBApp::getDesignContent();	
		} else {
			HEIBApp::getDashboardContent();
		}
		
	}

	public static function register_plugin_settings(){
		//register our settings
		register_setting( 'heib-settings-group', 'heib_blacklist_urls' );
	}
	public static function getDashboardContent(){
		?>
		<div class="wrap">
		<h2>Informative Boxes Settings</h2>

		<form method="post" action="options.php">
		    <?php settings_fields( 'heib-settings-group' ); ?>
		    <?php do_settings_sections( 'heib-settings-group' ); ?>
		    <table class="form-table">
		        <tr valign="top">
			        <th scope="row">Do not show Informative Boxes for urls</th>
			        <td>
			        	<textarea rows="5" cols="40" name="heib_blacklist_urls"><?php echo esc_attr( get_option('heib_blacklist_urls') ); ?></textarea>
			        </td>
		        </tr>		         
		    </table>
		    
		    <?php submit_button(); ?>

		</form>
		</div>
		<?php 
	}

	public static function getDesignContent(){
		echo '<div id="heib_wrapper"></div>';
		
		$settings = array( 'media_buttons' => false );
		$editor_id = 'heib-editor';

		wp_editor( '', $editor_id, $settings );		
	}

	public static function ajaxProcess(){
		$res = new HEIBResponse();
		$res = HEIBApp::processEndpoint($res);
		echo $res->toJson();
		exit;
	}

	public static function processEndpoint($res){
		$query = $res->query();
		if(!$query['endpoint']){
			$res->error = 1;
			$res->errMsg = 'No endpoints are provided';
		} else {
			$res = apply_filters('heib_process_endpoint__' . $query['endpoint'],  $res);
		}
		return $res;
	}

	/****************************************** End hook call back function ***************************************/
	
}

class HEIBResponse extends stdClass {
	protected $query;

	public function __construct($query = null){
		global $heib__Response;
		if(is_null($query)){
			$query = $_REQUEST;
		}
		$this->query = $query;

		//setup global  response
		$heib__Response = $this;
		// parent::__construct();
	}
	public function query(){
		return $this->query;
	}
	public function toJson(){
		return json_encode($this);
	}
	public function toObject(){
		$rtn = new stdClass();
		if(isset($this->data)){
			$rtn->data = $this->data;
		}
		if(isset($this->error)){
			$rtn->error = $this->error;
		}
		if(isset($this->errMsg)){
			$rtn->errMsg = $this->errMsg;
		}
		return $rtn;
	}
}

$GLOBALS['heib'] = HEIBApp::getInstance();
$GLOBALS['heib__Response'] = null;