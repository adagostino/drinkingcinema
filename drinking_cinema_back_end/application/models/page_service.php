<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');
    class page_service extends CI_Model {
        function __construct()
        {
            // Call the Model constructor
            parent::__construct();
            $this->load->library('tank_auth');
        }

        function get($pageName, $game = null){
            if ($this->tank_auth->is_admin()){
                // do some stuff -- or don't!!
                //echo $this->tank_auth->get_username()." is an admin";
            }
            $scripts = $this->script_service->getScripts($pageName);
            $page = array(
                'javascripts' => $scripts['js'],
                'stylesheets' => $scripts['css'],
            );
            $socialMedia = $this->social_media_service->get($pageName, $game);
            foreach ($socialMedia as $key => $value){
                $page[$key] = $value;
            }
            return $page;
        }

    }
?>