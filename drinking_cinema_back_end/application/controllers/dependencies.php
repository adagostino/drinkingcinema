<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Dependencies extends CI_Controller {
	function __construct() {
		parent::__construct();
	}


	public function index()
	{
		if(!$this->input->is_cli_request())
		{
			return show_404();
		}
		$scripts = $this->page_builder_service->get_all_dependencies();
		echo json_encode($scripts);
	}

}

/* End of file dependencies.php */
/* Location: ./application/controllers/dependencies.php */