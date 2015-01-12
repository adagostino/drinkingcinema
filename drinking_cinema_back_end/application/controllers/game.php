<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');
class game extends CI_Controller
{
    function __construct()
    {
        parent::__construct();
        $this->load->helper('url');
        $this->load->model('game_service');
    }

    function index(){
        redirect('');
    }

    function get(){
        $game = $this->game_service->get($this->uri->segment(2));
        if (!$game){
            return show_404();
        }
        $page = $this->page_service->get('game', $game);
        $page["title"] = $game["name"];
        $page["game"] = $game;


        $this->twiggy->set('page', $page)->template('game')->display();

    }

}
?>