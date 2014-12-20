<?php
    class script_service extends CI_Model {
        // create associative array to loop through to find the js associated with each page
        // split out first by common code over all pages, then each page
        // each page is split over common code for mobile and desktop, then mobile, then desktop
        // desktop is split for common code over desktop and then admin code

        private $jsJSON = array(
            "common" => array(
                "subClass.js",
                "dc.js",
                "models/dc-model.js"
            ),
            "search" => array(
                "common" => array(
                    "models/dc-model-search.js"
                ),
                "mobile" => array(),
                "desktop" => array(
                    "common" => array(),
                    "admin" => array()
                )
            )
        );

        private $cssJSON = array(
                    "common" => array(),
                    "search" => array(
                        "common" => array(),
                        "mobile" => array(),
                        "desktop" => array(
                            "common" => array(),
                            "admin" => array()
                        )
                    )
                );

        function __construct()
        {
            // Call the Model constructor
            parent::__construct();
            //$this->$jsJSON = $jsJSON;
        }

        function getJS($path = "", $platform = "desktop", $isAdmin = false) {
            return $this->parseJSON($this->jsJSON, $path, $platform, $isAdmin);
        }

        function parseJSON($json, $path, $platform, $isAdmin) {
            $a = array();
            if (isset($json["common"])) {
                $a = array_merge($a, $json["common"]);
            }

            if (isset($json[$platform])) {
                $a = array_merge($a, $this->parseJSON($json[$platform], $path, $platform, $isAdmin));
            }

            if ($isAdmin && isset($json["admin"])){
                $a = array_merge($a, $json["admin"]);
            }

            if (isset($json[$path])){
                $a = array_merge($a,$this->parseJSON($json[$path], $path, $platform, $isAdmin));
            }
            return $a;
        }


    }

?>