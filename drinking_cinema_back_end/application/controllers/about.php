<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');
class about extends CI_Controller
{
    function __construct()
    {
        parent::__construct();
        $this->load->helper('url');
        $this->load->model('page_service');
        $this->load->model('search_service');
        $this->load->library('tank_auth');
    }

    function index(){
        $pageContent = $this->page_service->get("about");
        if (!$pageContent){
            return show_404();
        }
        $isAdmin = $this->tank_auth->is_admin();
        $page = $this->page_builder_service->get_data('page', $isAdmin);
        $page["title"] = "About";
        $page["page"] = $pageContent;
        $page["cdn"] = $this->globals->get_CDN(true);
        $page["comments"] = $this->search_service->search_comments($pageContent["pageName"], null, 5);
        $page["subheader"] = "#dc-additional-pages-subheader-template";
        $page["isAdmin"] = $isAdmin;
        $this->twiggy->set('page', $page)->template('page')->display();
    }

}
?>