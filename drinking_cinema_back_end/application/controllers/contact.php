<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');
class contact extends CI_Controller
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
        $pageContent = $this->page_service->get("contact");
        if (!$pageContent){
            return show_404();
        }
        $page = $this->page_builder_service->get_data('page');
        $page["title"] = "Contact";
        $page["page"] = $pageContent;
        $page["cdn"] = $this->globals->get_CDN(true);
        $page["comments"] = $this->search_service->search_comments($pageContent["pageName"], null, 5);
        $page["subheader"] = $page["platform"] !== "mobile" ? "#dc-additional-pages-subheader-template" : "";
        $template = 'page';
        $template.= $page["platform"] === "mobile" ? "-mobile" : "";
        $this->twiggy->set('page', $page)->template($template)->display();
    }

}
?>