<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');
    include_once 'dependency.php';
    class search_dependency extends dependency {
        // create associative array to loop through to find the js associated with each page
        // split out first by common code over all pages, then each page
        // each page is split over common code for mobile and desktop, then mobile, then desktop
        // desktop is split for common code over desktop and then admin code
        public $_name = "search";
        public $_jsJSON = array(
            "common" => array(
                "models/dc-model-search.js",
                "controllers/dc-controller-search.js",
                "directives/dc-directive-infinite-scroll.js",
                "directives/dc-directive-embed-game.js",
                "services/dc-service-data-source.js"
            ),
            "mobile" => array(
                "common" =>array()
            ),
            "tablet" => array(),
            "desktop" => array(
                "common" => array(),
                "admin" => array()
            )
        );

        public $_cssJSON = array(
            "common" => array(
                "directives/dc-directive-infinite-scroll.css"
            ),
            "mobile" => array(
                "common" => array(
                    "views/mobile/dc-search-mobile.css"
                )
            ),
            "desktop" => array(
                "common" => array(
                    "views/subtemplates/desktop/dc-search-item-desktop.css",
                    "views/subtemplates/desktop/dc-search-nav-bar-desktop.css",
                    "directives/dc-directive-embed-game.css"
                ),
                "admin" => array()
            )
        );

        public $_htmlJSON = array(
            "common" => array(
                'directives/dc-directive-infinite-scroll.html',
                '_subtemplates/dc-no-search-results.html'
            ),
            "mobile" => array(
                "common" => array(
                    'controllers/mobile/search-mobile.html'
                )
            ),
            "tablet" => array(),
            "desktop" => array(
                "common" => array(
                    'controllers/search.html',
                    'directives/dc-directive-search-input.html',
                    '_subtemplates/dc-social-media.html',
                    '_subtemplates/dc-search-nav-bar-desktop.html',
                    '_subtemplates/dc-search-item-desktop.html',
                    'directives/dc-directive-embed-game.html'
                ),
                "desktop" => array(),
                "admin" => array()
            )
        );

        function __construct()
        {
            // Call the Model constructor
            parent::__construct();
            //$this->$jsJSON = $jsJSON;
        }




    }

?>