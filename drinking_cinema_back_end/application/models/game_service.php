<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');
    class game_service extends CI_Model {

        function __construct() {
            // Call the Model constructor
            parent::__construct();
            //$this->$jsJSON = $jsJSON;
        }

        function get($name){
            return "Getting Game Name ".$name;
        }

    }

?>