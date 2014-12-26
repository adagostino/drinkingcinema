<?php
    class script_service extends CI_Model {
        // create associative array to loop through to find the js associated with each page
        // split out first by common code over all pages, then each page
        // each page is split over common code for mobile and desktop, then mobile, then desktop
        // desktop is split for common code over desktop and then admin code

        private $jsBasePath = "web/javascript";
        private $cssBasePath = "web/css";
        private $minBasePath = "web/min";
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
                    "common" => array(
                        "dc.css"
                    ),
                    "desktop" => array(
                        "common" => array(
                            "views/subtemplates/desktop/dc-headers-desktop.css",
                            "views/subtemplates/desktop/dc-nav-bar-desktop.css",
                            "views/subtemplates/desktop/dc-social-media-buttons-desktop.css"
                        )
                    ),
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

        function getScripts($path = "", $platform = "desktop", $isAdmin = false, $isDebug = false){
            return array(
                'js' => $this->getJS($path, $platform, $isAdmin, $isDebug),
                'css' => $this->getCSS($path, $platform, $isAdmin, $isDebug)
            );
        }

        function getCSS($path = "", $platform = "desktop", $isAdmin = false, $isDebug = false) {
            $bp = $this->cssBasePath;
            $a = array(
                'basePath' => $bp,
                'relativePaths' => $this->parseJSON($this->cssJSON, $path, $platform, $isAdmin, $isDebug)
            );
            return $a;
        }

        function getJS($path = "", $platform = "desktop", $isAdmin = false, $isDebug = false) {
            $bp = $this->jsBasePath;
            $a = array(
                'basePath' => $bp,
                'relativePaths' => $this->parseJSON($this->jsJSON, $path, $platform, $isAdmin, $isDebug)
            );
            return $a;
        }

        function parseJSON($json, $path, $platform, $isAdmin, $isDebug) {
            $a = array();
            if (isset($json["common"])) {
                $a = array_merge($a, $json["common"]);
            }

            if (isset($json[$platform])) {
                $a = array_merge($a, $this->parseJSON($json[$platform], $path, $platform, $isAdmin, $isDebug));
            }

            if ($isAdmin && isset($json["admin"])){
                $a = array_merge($a, $json["admin"]);
            }

            if (isset($json[$path])){
                $a = array_merge($a,$this->parseJSON($json[$path], $path, $platform, $isAdmin, $isDebug));
            }
            return $a;
        }


    }

?>