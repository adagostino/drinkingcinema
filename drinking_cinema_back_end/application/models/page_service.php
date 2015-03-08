<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');
    class page_service extends CI_Model {
        private $_nav_bar_links = array(
            array(
                'name' => 'faq',
                'href' => '/faq',
                'hasX' => true
            ),
            array(
                'name' => 'about',
                'href' => '/about',
                'hasX' => true
            ),
            array(
                'name' => 'contact',
                'href' => '/contact',
                'hasX' => true
            ),
            array(
                'name' => 'follow'
            ),
            array(
                'name' => 'twitter',
                'href' => 'http://twitter.com/drinkingcinema',
                'target'=> '_blank'
            ),
            array(
                'name' => 'facebook',
                'href' => 'http://www.facebook.com/DrinkingCinema',
                'target'=> '_blank'
            ),
        );

        function __construct()
        {
            // Call the Model constructor
            parent::__construct();
            $this->load->library('tank_auth');
        }

        function get($pageName, $isAdmin = false, $game = null){
            if ($this->tank_auth->is_admin()){
                // do some stuff -- or don't!!
                //echo $this->tank_auth->get_username()." is an admin";
            }
            $scripts = $this->script_service->getScripts($pageName, "desktop", $isAdmin);
            $page = array(
                'javascripts' => $scripts['js'],
                'stylesheets' => $scripts['css'],
            );
            $socialMedia = $this->social_media_service->get($pageName, $game);
            foreach ($socialMedia as $key => $value){
                $page[$key] = $value;
            }
            $page["navBarLinks"] = $this->_nav_bar_links;
            $page["headerSize"] = $pageName === "game" ? "medium" : "large";
            return $page;
        }

    }
?>