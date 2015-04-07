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

        private $_platforms = array(
            "desktop",
            "tablet",
            "mobile"
        );

        function __construct()
        {
            // Call the Model constructor
            parent::__construct();
            $this->load->helper('url');
            $this->load->library('tank_auth');
            $this->load->library('Mobile_Detect');
            $this->load->model('social_media_service');
            $this->load->model('version_service');
            foreach ($this->_pages as $key=>$value){
                $this->load->model('page_dependencies/'.$value.'_dependency');
            }
            $this->detect = new Mobile_Detect();
        }

        function get_platform(){
            return $this->detect->isMobile() ? $this->detect->isTablet() ? "tablet": "mobile" : "desktop";
        }

        function get_debug(){
            parse_str($_SERVER['QUERY_STRING'], $_GET);
            $debug = $this->get_debug_cookie();
            if (isset($_GET["debug"])){
                $debug = $this->set_debug_cookie($_GET["debug"]);
            }
            return $debug;
        }

        function get_debug_cookie(){
            return isset($_COOKIE["dc_debug"]) ? $_COOKIE["dc_debug"] : 0;
        }

        function set_debug_cookie($debug){
            $debug = strtolower($debug) === "true" ? 1 : 0;
            setcookie("dc_debug", $debug, time() + (7*86400), "/");
            return $debug;
        }

        function get_all_dependencies(){
            $a = [];
            foreach ($this->_pages as $pageKey => $page){
                foreach ($this->_platforms as $pIdx => $platform){
                    $name = $page."-".$platform;
                    $a[$name] = $this->get_dependencies($page, false, $platform, true);
                    $a[$name."-admin"] = $this->get_dependencies($page, true, $platform, true);
                }
            }
            return $a;
        }

        function get_dependencies($pageName, $isAdmin = false, $platform ="desktop", $debug = false){
            $pageName = strtolower($pageName);
            if (!isset($this->_pages[$pageName])) return array();
            $dependency = $this->_pages[$pageName]."_dependency";
            return $this->$dependency->get_dependencies($platform, $isAdmin, $debug);
        }

        function get_data($pageName, $game = null){
            $isAdmin = $isAdmin = $this->tank_auth->is_admin();
            $platform = $this->get_platform();
            $debug = $this->get_debug();

            $page = $this->get_dependencies($pageName, $isAdmin, $platform, $debug);
            $page["isAdmin"] = $isAdmin;
            $page["platform"] = $platform;
            $page["debug"] = $debug;
            $page["isMobileChrome"] = $this->detect->isMobile() && $this->detect->is("chrome");
            $page["mobileChromeClass"] = $page["isMobileChrome"] ? "mobileChrome" : "";
            $socialMedia = $this->social_media_service->get($pageName, $game);
            foreach ($socialMedia as $key => $value){
                $page[$key] = $value;
            }
            $page["navBarLinks"] = $this->_nav_bar_links;
            $page["headerSize"] = $pageName === "game" ? "medium" : "large";
            $page["controllerName"] = $pageName;
            $page["versions"] = $this->version_service->get_versions();
            return $page;
        }

    }
?>