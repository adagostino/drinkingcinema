<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');
class Upload extends CI_Controller {
    function __construct() {
        parent::__construct();
        $this->load->library('tank_auth');
    }

    function index() {
        $scripts = $this->script_service->getScripts("upload");
        $page = array(
            'title' => 'Upload',
        	'javascripts' => $scripts['js'],
        	'stylesheets' => $scripts['css'],
        	'ogUrl' => "http://localhost/upload",
        	'pinUrl' => "http://localhost/upload",
        	'tweet' => "Sup Dawg!"
        );

        if ($this->tank_auth->is_admin()){
        			// do some stuff -- or don't!!
        			//echo $this->tank_auth->get_username()." is an admin";
        }
        $this->twiggy->set('page', $page)->template('upload')->display();
    }

}
?>