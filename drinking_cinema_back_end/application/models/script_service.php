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
                // utilites
                "utilities/subClass.js",
                "utilities/htmlparser.js",
                "utilities/parser.js",
                "utilities/observe.js",
                "utilities/generateGUID.js",
                // base functions
                "dc.js",
                "dc-parse-view.js",
                "dc-watch-element.js",
                // model
                "models/dc-model.js",
                // controller
                "controllers/dc-controller.js",
                // directive
                "directives/dc-directive.js"
            ),
            "desktop" => array(
                "common" => array(
                    "controllers/dc-controller-header.js",
                    "directives/dc-directive-searchInput.js"
                )
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
            ),
            "game" => array(
                "common" => array(
                    "models/dc-model-game.js",
                    "controllers/dc-controller-game.js"
                ),
                "mobile" => array(),
                "desktop" => array(
                    "common" => array(
                        "controllers/dc-controller-game-desktop.js"
                    ),
                    "admin" => array(
                        "controllers/dc-controller-game-desktop-admin.js"
                    )
                )
            ),
            "upload" => array(
                "common" => array(
                    "models/dc-model-game.js"
                ),
                "mobile" => array(),
                "desktop" => array(
                    "common" => array(

                    ),
                    "admin" => array(
                        "utilities/jquery.Jcrop.js",
                        "controllers/dc-controller-upload.js",
                        "directives/dc-directive-modal.js",
                        "directives/dc-directive-editable.js",
                        "directives/dc-directive-editable-rte.js",
                        "directives/dc-directive-game-image.js",
                        "directives/dc-directive-upload-thumbnail.js",
                        "directives/dc-directive-upload-image.js",
                        "directives/dc-directive-embed-game.js"
                    )
                )
            )
        );

        private $cssJSON = array(
                    "common" => array(
                        "dc.css",
                        "views/subtemplates/dc-buttons.css"
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
                    ),
                    "upload" => array(
                        "common" => array(),
                        "mobile" => array(),
                        "desktop" => array(
                            "common" => array(
                                "views/dc-game-desktop.css",
                                "views/dc-upload-desktop.css",
                                "directives/dc-directive-embed-game.css",
                            ),
                            "admin" => array(
                                "utilities/jcrop.css",
                                "directives/dc-directive-modal.css",
                                "directives/dc-directive-editable.css",
                                "directives/dc-directive-game-image.css",
                                "directives/dc-directive-upload-thumbnail.css",
                                "directives/dc-directive-upload-image.css",
                                "views/subtemplates/desktop/dc-search-item-desktop.css"
                            )
                        )
                    )
                );

        function __construct()
        {
            // Call the Model constructor
            parent::__construct();
            //$this->$jsJSON = $jsJSON;
        }

        function getScripts($path = "", $platform = "desktop", $isAdmin = true, $isDebug = false){
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