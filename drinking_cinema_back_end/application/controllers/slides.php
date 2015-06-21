<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');
class slides extends CI_Controller
{
    function __construct()
    {
        parent::__construct();
        $this->load->helper('url');
        $this->load->model('slideshow_service');
        $this->load->model('search_service');
        $this->load->library('tank_auth');
    }

    function index(){
        $results = $this->search_service->search_slideshows("newest");
        $title = "Slideshows";
        $page = $this->page_builder_service->get_data('slideshows');
        $page["title"] = $title;
        $page["results"] = $results;

        //echo json_encode($page);
        $this->twiggy->set('page', $page)->template('slideshows')->display();
    }

    function get(){
        $show = $this->slideshow_service->get($this->uri->segment(2));
        if (!$show){
            return show_404();
        }
        $imageDir = $this->globals->get_slideshow_dir(true);
        $page = $this->page_builder_service->get_data('slideshow');

        $page["title"] = $show["name"];
        $page["slideshow"] = $show;
        $this->twiggy->set('page', $page)->template('slideshow')->display();

        /*
        if ($page["platform"] !== "mobile") {
            $page["subheader"] = "#dc-share-input-template";
            $page["share"] = array(
                'value' => 'http://chug.to/'.$page["game"]["nameUrl"]
            );
        } else {
            $page["headerSize"] = "hidden";
        }
        $template = 'game';
        $template.= $page["platform"] === "mobile" ? "-mobile" : "";
        $this->twiggy->set('page', $page)->template($template)->display();
        */

    }

}
?>