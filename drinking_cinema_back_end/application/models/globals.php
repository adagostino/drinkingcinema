<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');
    class globals extends CI_Model {
        private $cdn = "../cdn.drinkingcinema.com/";
        private $game_images_directory = "Games/";
        private $upload_images_directory = "uli/";

        function __construct() {
            // Call the Model constructor
            parent::__construct();
        }

        function get_CDN() {
            return $this->cdn;
        }

        function get_games_dir() {
            return $this->cdn.$this->game_images_directory;
        }

        function get_upload_dir() {
            return $this->cdn.$this->upload_images_directory;
        }
    }

?>