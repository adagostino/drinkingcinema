<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');
    class globals extends CI_Model {
        private $cdn = "../cdn.drinkingcinema.com/";
        private $game_images_directory = "Games/";
        private $upload_images_directory = "uli/";
        private $images_directory = "Images/";
        private $slideshow_images_directory = "ss/";
        private $script_guid = "1432746769783_PaP76YQK3UOEMGEt";

        function __construct() {
            // Call the Model constructor
            parent::__construct();
        }

        private function get_url($url){
            return $this->config->item("is_local") ? str_replace("../cdn", "http://cdn_local", $url) : str_replace("../","http://", $url);
        }

        function get_CDN($url = null) {
            $dir = $this->cdn;
            return $url ? $this->get_url($dir) : $dir;
        }

        function get_games_dir($url = null) {
            $dir = $this->cdn.$this->game_images_directory;
            return $url ? $this->get_url($dir) : $dir;
        }

        function get_upload_dir($url = null) {
            $dir = $this->cdn.$this->upload_images_directory;
            return $url ? $this->get_url($dir) : $dir;
        }

        function get_images_dir($url = null) {
            $dir = $this->cdn.$this->images_directory;
            return $url ? $this->get_url($dir) : $dir;
        }

        function get_slideshow_dir($url = null) {
            $dir = $this->cdn.$this->slideshow_images_directory;
            return $url ? $this->get_url($dir) : $dir;
        }

        function get_script_guid(){
            return $this->script_guid;
        }

    }

?>