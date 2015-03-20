<?php
    class dependency extends CI_Model {
        // create associative array to loop through to find the js associated with each page
        // split out first by common code over all pages, then each page
        // each page is split over common code for mobile and desktop, then mobile, then desktop
        // desktop is split for common code over desktop and then admin code
        private $jsBasePath = "/web/javascript";
        private $cssBasePath = "/web/css";
        private $minBasePath = "/web/min";

        private $_commonJSJSON = array(
            "common" => array(
                // utilites
                "utilities/htmlparser.js",
                "utilities/parser.js",
                "utilities/observe.js",
                "utilities/generateGUID.js",
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
                // directive
                "directives/dc-directive.js",
                // service
                "services/dc-service.js"
            ),
            "desktop" => array(
                "common" => array(
                    "controllers/dc-controller-header.js",
                    "directives/dc-directive-searchInput.js"
                )
            )
        );

        private $_commonCSSJSON = array(
            "common" => array(
                "dc.css",
                "globals/dc-keyframes.css",
                "globals/dc-sprites.css",
                "views/subtemplates/dc-buttons.css"
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
            "common" => array(),
            "mobile" => array(),
            "tablet" => array(),
            "desktop" => array(
                "common" => array(
                    'controllers/header.html'
                ),
                "desktop" => array(),
                "admin" => array()
            )
        );

        function __construct()
        {
            // Call the Model constructor
            parent::__construct();
        }

        function get_dependencies(){

        }

        function mergeHTML($a, $b, $map){
            foreach ($b as $key=>$value){
                if ($htmlObj = $this->getHTMLObj($value)){
                    if (!isset($map[$htmlObj["id"]])){
                        $map[$htmlObj["id"]] = $map["count"]++;
                        $a[] = $htmlObj["path"];
                    } else {
                        $a[$map[$htmlObj["id"]]] = $htmlObj["path"];
                    }
                };
            }
            return array(
                "html" => $a,
                "map" => $map
            );
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
                $seg = explode("/", $obj);
                $fn = explode(".",end($seg));
                array_pop($fn);
                $fn = join(".",$fn);

                if (preg_match("/controller/i",$path)){
                    $id = "dc-controller-".$fn;
                } else {
                    $id = $fn;
                }
                $id.="-template";
            }
            if (!$id) return;
            $html = '<script type="dc-template" id="';
            $html.= $id;
            $html.= '">';
            $html.= "{{ source('";
            $html.= $path;
            $html.= "') }}";
            $html.= "</script>";
            $html = htmlspecialchars($html);
            return array(
                "id" => $id,
                "html" => $html,
                "path" => $path
            );
        }

        function constuctHTML($htmlObj){
            $a = [];
            foreach ($htmlObj["map"] as $id=>$idx){
                if ($id !== "count"){
                    $html = '<script type="dc-template" id="';
                    $html.= $id;
                    $html.= '">';
                    $html.= "{{ source('";
                    $html.= $htmlObj["html"][$idx];
                    $html.= "') }}";
                    $html.= "</script>";
                    $a[] = htmlspecialchars($html);
                }
            }
            return $a;
        }

        function platformExists($json, $platform){
            return isset($json[$platform]) && count($json[$platform]);
        }

        function getPlatformJSON($json, $platform){
            return  $this->platformExists($json, $platform) ? $json[$platform] :
                    $this->platformExists($json, "desktop") ? $json["desktop"] :
                    null;
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

        function parseHTMLJSON($json, $platform, $isAdmin, $map = null){
            $a = array();
            if (!$map) $map = array(
                "count" => 0
            );
            if (!$json) return array("html" => $a, "map" => $map);

            if (isset($json["common"])){
                $merged = $this->mergeHTML($a, $json["common"], $map);
                $a = $merged["html"];
                $map = $merged["map"];
            }
            $platformJSON = $this->getPlatformJSON($json, $platform);
            $platformHTMLObj = $this->parseHTMLJSON($platformJSON, $platform, $isAdmin, $map);
            $merged = $this->mergeHTML($a, $platformHTMLObj["html"], $platformHTMLObj["map"]);
            $a = $merged["html"];
            $map = $merged["map"];
            if ($isAdmin && isset($json["admin"])) {
                $adminHTMLObj = $this->parseHTMLJSON($json["admin"], $platform, $isAdmin, $map);
                $merged = $this->mergeHTML($a, $adminHTMLObj["html"] , $adminHTMLObj["map"]);
                $a = $merged["html"];
                $map = $merged["map"];
            }
            return array(
                "html" => $a,
                "map" => $map
            );
        }

        function getJS($platform = "desktop", $isAdmin = false, $isDebug = false){
            $a = $this->parseJSON($this->_commonJSJSON, $platform, $isAdmin);
            $a = array_merge($a, $this->parseJSON($this->_jsJSON, $platform, $isAdmin));
            $bp = $this->jsBasePath;
            $output = array(
                'basePath' => $bp,
                'relativePaths' => $a
            );
            return $output;
        }

        function getCSS($platform = "desktop", $isAdmin = false, $isDebug = false){
            $a = $this->parseJSON($this->_commonCSSJSON, $platform, $isAdmin);
            $a = array_merge($a, $this->parseJSON($this->_cssJSON, $platform, $isAdmin));
            $bp = $this->cssBasePath;
            $output = array(
                'basePath' => $bp,
                'relativePaths' => $a
            );
            return $output;
        }

        function getHTML($platform = "desktop", $isAdmin = false, $isDebug = false){
            $commonHTMLObj = $this->parseHTMLJSON($this->_commonHTMLJSON, $platform, $isAdmin);;
            $a = $commonHTMLObj["html"];
            $map = $commonHTMLObj["map"];
            $pageHTMLObj = $this->parseHTMLJSON($this->_htmlJSON, $platform, $isAdmin, $map);
            $merged = $this->mergeHTML($a, $pageHTMLObj["html"], $pageHTMLObj["map"]);
            return array(
                "ids" => $merged["map"],
                "html" => $this->constuctHTML($merged)
            );
        }

    }

?>