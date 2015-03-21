<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');
    include_once 'dependency.php';
    class embed_dependency extends dependency {
        // create associative array to loop through to find the js associated with each page
        // split out first by common code over all pages, then each page
        // each page is split over common code for mobile and desktop, then mobile, then desktop
        // desktop is split for common code over desktop and then admin code
        public $_jsJSON = array(
            "common" => array(
                "controllers/dc-controller-embed.js"
            ),
            "mobile" => array(),
            "tablet" => array(),
            "desktop" => array(
                "common" => array(
                    "controllers/dc-controller-embed-desktop.js",
                    "directives/dc-directive-tooltip.js",
                    "directives/dc-directive-tooltip-image.js"
                ),
                "admin" => array()
            )
        );

        public $_cssJSON = array(
            "common" => array(),
            "mobile" => array(),
            "desktop" => array(
                "common" => array(
                    "views/dc-embed-desktop.css",
                    "directives/dc-directive-tooltip.css",
                    "directives/dc-directive-tooltip-image.css"
                ),
                "admin" => array()
            )
        );

        public $_htmlJSON = array(
            "common" => array(),
            "mobile" => array(),
            "tablet" => array(),
            "desktop" => array(
                "common" => array(
                    'controllers/embed.html',
                    'directives/dc-directive-tooltip.html',
                    '_subtemplates/dc-tooltip-image.html',
                    '_subtemplates/dc-social-media.html'
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




    }

?>