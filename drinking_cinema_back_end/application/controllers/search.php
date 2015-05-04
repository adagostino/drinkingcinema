<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');
class search extends CI_Controller
{
    function __construct()
    {
        parent::__construct();
        $this->load->helper('url');
        $this->load->model('search_service');
        $this->load->library('tank_auth');
    }

    function index(){
        $this->get();
    }

    function get(){
        $searchTerms = trim(urldecode(strtolower ($this->uri->segment(2))));
        $title = "DC Search: ".$searchTerms;
        if ($searchTerms === "") {
            $title = "Drinking Cinema";
            $searchTerms = "newest";
        }
        $numResults = 5;
        parse_str($_SERVER['QUERY_STRING'], $_GET);
        if (isset($_GET["n"])){
            $numResults = intval($_GET["n"]);
        }
        if (!$numResults || $numResults < 5) $numResults = 5;
        // get search results
        $results = $this->search_service->search_movies($searchTerms, 0, $numResults);

        $page = $this->page_builder_service->get_data('search');
        $page["title"] = $title;
        $page["results"] = $results;
        $page["searchTerms"] = $searchTerms;
        $page["searchNavItems"] = array(
            "a-z",
            "z-a",
            "newest",
            "oldest"
        );
        $page["subheader"] = $page["platform"] !== "mobile" ? "#dc-search-nav-bar-template" : "";

        $template = 'search';
        $template.= $page["platform"] === "mobile" ? "-mobile" : "";
        $this->twiggy->set('page', $page)->template($template)->display();

    }

}
?>