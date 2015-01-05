<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');
    class game_service extends CI_Model {

        function __construct() {
            // Call the Model constructor
            parent::__construct();
        }

        function get($name){
            return "Getting Game Name ".$name;
        }

        function upload_image($name){
            $path = $this->globals->get_games_dir().$name;
            return $path;
        }

    }

?>