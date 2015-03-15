<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');
class embed extends CI_Controller
{
    function __construct()
    {
        parent::__construct();
        $this->load->helper('url');
        $this->load->model('game_service');
        $this->load->model('search_service');
    }

    function index(){
        redirect('');
    }

    function get(){
        $game = $this->game_service->get($this->uri->segment(2));
        if (!$game){
            return show_404();
        }
        $isAdmin = true;

        $imageDir = $this->globals->get_images_dir(true);

        $page = $this->page_builder_service->get_data('embed', $isAdmin, $game);

        $page["title"] = $game["name"];
        $page["game"] = $game;
        $this->twiggy->set('page', $page)->template('embed')->display();

    }

}
?>