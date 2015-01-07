<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');
    class game_service extends CI_Model {

        function __construct() {
            // Call the Model constructor
            parent::__construct();
            $this->load->model('image_service');
        }

        function get($name){
            return "Getting Game Name ".$name;
        }

        function upload_image($fileName, $name){
            return $this->image_service->upload_game($fileName, $name);
        }

        function upload_thumbnail($name, $coords) {
            $images = array();
            $images["thumbnail"] = $this->image_service->create_game_thumbnail($name, $coords, 60, "_thumb");
            $images["thumbnail_og"] = $this->image_service->create_game_thumbnail($name, $coords, 200, "_sn_thumb");
            return $images;
        }

    }

?>