<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');
    class dependency extends CI_Model {
        // create associative array to loop through to find the js associated with each page
        // split out first by common code over all pages, then each page
        // each page is split over common code for mobile and desktop, then mobile, then desktop
        // desktop is split for common code over desktop and then admin code
        private $jsBasePath = "/web/javascript";
        private $cssBasePath = "/web/css";

        private $_commonJSJSON = array(
            "common" => array(
                // utilites
                "utilities/htmlparser.js",
                "utilities/parser.js",
                "utilities/observe.js",
                "utilities/generateGUID.js",
                "utilities/hammer.min.js",
                // view parser
                "viewParser/dc-view-parser.js",
                "viewParser/dc-view-parser-parsing.js",
                "viewParser/dc-view-parser-directives.js",
                // base functions
                "dc.js",
                "dc-watch-element.js",
                // model
                "models/dc-model.js",
                // controller
                "controllers/dc-controller.js",
                "controllers/dc-controller-header.js",
                // directive
                "directives/dc-directive.js",
                "directives/dc-directive-modal.js",
                "directives/dc-directive-lightbox.js",
                // service
                "services/dc-service.js",
                "services/dc-service-modal.js",
                "services/dc-service-transformObject.js",
                "services/dc-service-transitionObject.js"
            ),
            "mobile" => array(
                "common" => array(
                    "models/dc-model-search.js",
                    "controllers/dc-controller-header-mobile.js",
                    "directives/dc-directive-autocomplete.js",
                    "directives/dc-directive-input.js"
                )
            ),
            "desktop" => array(
                "common" => array(
                    "directives/dc-directive-searchInput.js",
                    "directives/dc-directive-autocomplete.js"
                )
            )
        );

        private $_commonCSSJSON = array(
            "common" => array(
                "dc.css",
                "globals/dc-keyframes.css",
                "globals/dc-sprites.css",
                "views/subtemplates/dc-buttons.css",
                "views/subtemplates/dc-lightbox-modal.css"
            ),
            "mobile" => array(
                "common" => array(
                    "dc-mobile.css",
                    "views/mobile/dc-header-mobile.css",
                    "views/subtemplates/mobile/dc-nav-bar-mobile.css",
                    "views/subtemplates/mobile/dc-search-nav-bar-mobile.css",
                    "views/subtemplates/mobile/dc-autocomplete-search-modal-mobile.css",
                    "views/subtemplates/mobile/dc-autocomplete-search-item-mobile.css",
                    "views/subtemplates/mobile/dc-search-item-mobile.css",
                    "directives/dc-directive-input.css"
                )
            ),
            "desktop" => array(
                "common" => array(
                    "views/subtemplates/desktop/dc-headers-desktop.css",
                    "views/subtemplates/desktop/dc-nav-bar-desktop.css",
                    "views/subtemplates/desktop/dc-social-media-buttons-desktop.css"
                )
            )
        );

        private $_commonHTMLJSON = array(
            "common" => array(
                '_subtemplates/dc-lightbox-modal.html',
                '_subtemplates/dc-lightbox-modal-item.html'
            ),
            "mobile" => array(
                "common" => array(
                    'controllers/mobile/header-mobile.html',
                    '_subtemplates/mobile/dc-nav-bar-mobile.html',
                    '_subtemplates/mobile/dc-search-nav-bar-mobile.html',
                    '_subtemplates/mobile/dc-autocomplete-search-modal-mobile.html',
                    '_subtemplates/mobile/dc-search-item-mobile.html',
                    'directives/dc-directive-input.html'
                )
            ),
            "tablet" => array(),
            "desktop" => array(
                "common" => array(
                    'controllers/header.html',
                    '_subtemplates/dc-nav-bar.html'
                ),
                "desktop" => array(),
                "admin" => array()
            )
        );

        function __construct()
        {
            // Call the Model constructor
            parent::__construct();
            $this->guid = $this->globals->get_script_guid();
        }

        function get_dependencies($platform = "desktop", $isAdmin = false, $isDebug = false){
            return array(
                'javascripts' => $this->getJS($platform, $isAdmin, $isDebug),
                'stylesheets' => $this->getCSS($platform, $isAdmin, $isDebug),
                'views' => $this->getHTML($platform, $isAdmin, $isDebug)
            );
        }

        function getHTMLMapFromJSON($json){
            $a = array();
            foreach ($json as $key=>$value){
                if ($htmlObj = $this->getHTMLObj($value)){
                    $a[$htmlObj["id"]] = $htmlObj["path"];
                }
            }
            return $a;
        }

        function mergeHTML($a,$b){
            foreach ($b as $id=>$source){
                $a[$id] = $source;
            }
            return $a;
        }

        function getHTMLObj($obj){
            // if type is string, do one thing, otherwise if it's an array, do another
            $type = gettype($obj);
            $id = "";
            $path = "";
            if ($type === "array"){
                $id = $obj["id"];
                $path = $obj["path"];
            } else if ($type === "string") {
                $path = $obj;
                $pattern = '/(?:[^\/]+\/)*([^\/]+)(?:\.html)/i';
                $id = preg_replace_callback($pattern, function ($matches) {
                    $match = $matches[1] ? preg_replace("/-admin|-desktop|-mobile|-tablet/i","",$matches[1]) : "";
                    return $match;
                }, $path);

                if ($id) {
                    if (preg_match("/controller/i",$path)){
                        $id = "dc-controller-".$id;
                    }
                    $id.="-template";
                }
            }
            if (!$id) return;
            return array(
                "id" => $id,
                "path" => $path
            );
        }

        function platformExists($json, $platform){
            return isset($json[$platform]) && count($json[$platform]);
        }

        function getPlatformJSON($json, $platform){
            $rJSON = null;
            if ($this->platformExists($json, $platform)){
                $rJSON = $json[$platform];
            } else if ($this->platformExists($json, "desktop")){
                $rJSON = $json["desktop"];
            }
            return $rJSON;
        }

        function parseJSON($json, $platform, $isAdmin){
            $a = array();
            if (!$json) return $a;
            if (isset($json["common"])) {
                $a = array_merge($a, $json["common"]);
            }
            $platformJSON = $this->getPlatformJSON($json, $platform);
            $a = array_merge($a, $this->parseJSON($platformJSON, $platform, $isAdmin));

            if ($isAdmin && isset($json["admin"])) {
                $a = array_merge($a, $json["admin"]);
            }
            return $a;
        }

        function parseHTMLJSON($json, $platform, $isAdmin){
            $a = array();
            if (!$json) return $a;
            if (isset($json["common"])){
                $a = $this->mergeHTML($a, $this->getHTMLMapFromJSON($json["common"]));
            }
            $platformJSON = $this->getPlatformJSON($json, $platform);
            $a = $this->mergeHTML($a, $this->parseHTMLJSON($platformJSON, $platform, $isAdmin));
            if (isset($json["admin"]) && $isAdmin){
                $a = $this->mergeHTML($a, $this->getHTMLMapFromJSON($json["admin"]));
            }
            return $a;
        }

        function getJS($platform = "desktop", $isAdmin = false, $isDebug = false){
            if ($isDebug) {
                $a = $this->parseJSON($this->_commonJSJSON, $platform, $isAdmin);
                $a = array_merge($a, $this->parseJSON($this->_jsJSON, $platform, $isAdmin));
            } else {
                $a = array("min/".$this->_name."-".$platform.($isAdmin ? "-admin" : "")."-".$this->guid.".js");
            }
            $bp = $this->jsBasePath;
            $output = array(
                'basePath' => $bp,
                'relativePaths' => $a
            );
            return $output;
        }

        function getCSS($platform = "desktop", $isAdmin = false, $isDebug = false){
            if ($isDebug){
                $a = $this->parseJSON($this->_commonCSSJSON, $platform, $isAdmin);
                $a = array_merge($a, $this->parseJSON($this->_cssJSON, $platform, $isAdmin));
            } else {
                $a = array("min/".$this->_name."-".$platform.($isAdmin ? "-admin" : "")."-".$this->guid.".css");
            }
            $bp = $this->cssBasePath;
            $output = array(
                'basePath' => $bp,
                'relativePaths' => $a
            );
            return $output;
        }

        function getHTML($platform = "desktop", $isAdmin = false, $isDebug = false){
            return $this->mergeHTML($this->parseHTMLJSON($this->_commonHTMLJSON, $platform, $isAdmin),
                                    $this->parseHTMLJSON($this->_htmlJSON, $platform, $isAdmin));
        }

    }

?>