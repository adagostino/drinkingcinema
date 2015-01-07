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
            $images["name"] = $name;
            $images["ext"] = "jpg";
            return $images;
        }

        function upload_game($game) {
            // look at tester, getLinks, replace element with attr
            // get each link, then test to see if it's an image, if it is, replace the link with the new
            // image you've curled
        }

    }

?>