<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');
    class page_builder_service extends CI_Model {
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

        private $_pages = array(
            "search" => "search",
            "game" => "game",
            "page" => "page",
            "embed" => "embed",
            "upload" => "upload"
        );

        function __construct()
        {
            // Call the Model constructor
            parent::__construct();
            $this->load->library('tank_auth');
            $this->load->model('social_media_service');
            foreach ($this->_pages as $key=>$value){
                $this->load->model('page_dependencies/'.$value.'_dependency');
            }

        }

        function get_dependencies($pageName, $platform ="desktop", $isAdmin = false, $debug = false){
            $pageName = strtolower($pageName);
            if (!isset($this->_pages[$pageName])) return array();
            $dependency = $this->_pages[$pageName]."_dependency";
            return $this->$dependency->get_dependencies($platform, $isAdmin, $debug);
        }

        function get_data($pageName, $isAdmin = false, $game = null){
            $page = $this->get_dependencies($pageName, "desktop", $isAdmin);
            $socialMedia = $this->social_media_service->get($pageName, $game);
            foreach ($socialMedia as $key => $value){
                $page[$key] = $value;
            }
            $page["navBarLinks"] = $this->_nav_bar_links;
            $page["headerSize"] = $pageName === "game" ? "medium" : "large";
            $page["controllerName"] = $pageName;
            return $page;
        }

    }
?>