<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Welcome extends CI_Controller {

	/**
	 * Index Page for this controller.
	 *
	 * Maps to the following URL
	 * 		http://example.com/index.php/welcome
	 *	- or -  
	 * 		http://example.com/index.php/welcome/index
	 *	- or -
	 * Since this controller is set as the default controller in 
	 * config/routes.php, it's displayed at http://example.com/
	 *
	 * So any other public methods not prefixed with an underscore will
	 * map to /index.php/welcome/<method_name>
	 * @see http://codeigniter.com/user_guide/general/urls.html
	 */
	function __construct() {
		parent::__construct();
		$this->load->library('tank_auth');
	}

	public function index()
	{
		//$this->load->view('welcome_message');
		$scripts = $this->script_service->getScripts("game");
		$page = array(
			'title' => 'Welcome',
			'javascripts' => $scripts['js'],
			'stylesheets' => $scripts['css'],
			'ogUrl' => "http://localhost/",
			'pinUrl' => "http://localhost/",
			'tweet' => "Sup Dawg!"
		);

		if ($this->tank_auth->is_admin()){
			// do some stuff -- or don't!!
			//echo $this->tank_auth->get_username()." is an admin";
		}
		$this->twiggy->set('page', $page)->template('index')->display();
	}
}

/* End of file welcome.php */
/* Location: ./application/controllers/welcome.php */