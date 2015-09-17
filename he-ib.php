<?php
/*
Plugin Name: he-ib
Plugin URI: http://halo.social/?return=true
Description: HaloEngine Informative Boxes plugin for WordPress
Version: 1.0.0
Author: HungTran
Author URI: http://halo.social/wordpress-plugins/
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
	}

	private function adminHooks(){
		//admin menu
		add_action('admin_menu', 'HEIBApp::admin_menu');
	
	}
	
	private function frontendHooks(){
	
	}

	private function apiHooks(){
	
	}
	
	private function commonHooks(){
	
	}
	
	/****************************************** Define hook call back function ***************************************/
	public static function admin_menu(){
		$parent_slug = 'heib_dashboard';
		$handle = 'HEIBApp::admin_content';
		//menu page
		$page = add_menu_page( 	'Informative Boxes',
						'Informative Boxes',
						//'manage_options',
						'publish_pages',
						$parent_slug,
						$handle,
						plugins_url( 'halosocial/app/views/default/assets/ico/favicon-16x16.png' ),
						6 );
		add_action( 'admin_print_styles-' . $page, 'HEIBApp::admin_enqueue_styles' );
		add_action( 'admin_print_scripts-' . $page, 'HEIBApp::admin_enqueue_scripts' );
	
	}

	public static function admin_enqueue_styles(){
	
	}
	
	public static function admin_enqueue_scripts(){
		wp_enqueue_script( 'heibadmin', plugins_url( '/dist/bundle.js' , __FILE__ ), array( 'jquery' ));
	}
	
	public static function admin_content(){
		echo '<div id="heib_wrapper"></div>';
	}

	/****************************************** End hook call back function ***************************************/
	
}

$GLOBALS['heib'] = HEIBApp::getInstance();