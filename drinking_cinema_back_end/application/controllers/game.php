<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');
class game extends CI_Controller
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

        $page = $this->page_service->get('game', $isAdmin, $game);
        $page["title"] = $game["name"];
        $page["game"] = $game;
        $page["cdn"] = $this->globals->get_CDN(true);
        $page["comments"] = $this->search_service->search_comments($game["nameUrl"], null, 5);
        $page["vendors"] = array(
            array(
                'name' => 'netflix',
                'url' => 'http://www.netflix.com/WiSearch?v1=',
                'image' => $imageDir.'netflixIcon.png'
            ),
            array(
                'name' => 'hulu',
                'url' => 'http://www.hulu.com/search?query=',
                'image' => $imageDir.'huluIcon.png'
            ),
            array(
                'name' => 'amazon',
                'url' => 'http://www.amazon.com/s/field-keywords=',
                'image' => $imageDir.'amazonIcon.png'
            )
        );

        $page["isAdmin"] = $isAdmin;
        $this->twiggy->set('page', $page)->template('game')->display();

    }

}
?>