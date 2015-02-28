<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');
class search extends CI_Controller
{
    function __construct()
    {
        parent::__construct();
        $this->load->helper('url');
        $this->load->model('search_service');
    }

    function index(){
        $this->get();
    }

    function get(){
        $searchTerms = $this->uri->segment(2);
        if (trim(urldecode(strtolower ($searchTerms))) == "") $searchTerms = "newest";
        // get search results
        $results = $this->search_service->search_movies($searchTerms, 0, 5);

        $isAdmin = true;

        $page = $this->page_service->get('search', $isAdmin);
        $page["title"] = "search";
        $page["results"] = $results;
        $page["cdn"] = $this->globals->get_CDN(true);
        $page["isAdmin"] = $isAdmin;


        $this->twiggy->set('page', $page)->template('search')->display();

    }

}
?>