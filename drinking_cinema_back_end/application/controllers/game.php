<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');
class game extends CI_Controller
{
    function __construct()
    {
        parent::__construct();
        $this->load->helper('url');
        $this->load->model('game_service');
        $this->load->model('search_service');
        $this->load->library('tank_auth');
    }

    function index(){
        redirect('');
    }

    function get(){
        $game = $this->game_service->get($this->uri->segment(2));
        if (!$game){
            return show_404();
        }
        $imageDir = $this->globals->get_images_dir(true);
        $page = $this->page_builder_service->get_data('game', $game, $game["nameUrl"]);

        $page["title"] = $game["name"];
        $page["game"] = $game;
        $page["vendors"] = array(
            array(
                'name' => 'netflix',
                'url' => 'http://www.netflix.com/WiSearch?v1=',
                'image' => $imageDir.'netflixIcon.png',
                'affiliate' => ''
            ),
            array(
                'name' => 'hulu',
                'url' => 'http://www.hulu.com/search?query=',
                'image' => $imageDir.'huluIcon.png',
                'affiliate' => ''
            ),
            array(
                'name' => 'amazon',
                'url' => 'http://www.amazon.com/s/field-keywords=',
                'image' => $imageDir.'amazonIcon.png',
                'affiliate' => "?camp=1789&creative=9325&linkCode=as2&tag=drinkcinem-20"
            )
        );
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

    }

}
?>