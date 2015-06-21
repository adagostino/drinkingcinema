<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');
include_once 'dependency.php';
class slideshows_dependency extends dependency {
    // create associative array to loop through to find the js associated with each page
    // split out first by common code over all pages, then each page
    // each page is split over common code for mobile and desktop, then mobile, then desktop
    // desktop is split for common code over desktop and then admin code
    public $_name = "game";
    public $_jsJSON = array(
        "common" => array(
            "models/dc-model-search.js",
            "controllers/dc-controller-slideshows.js",
            "directives/dc-directive-infinite-scroll.js",
            "services/dc-service-data-source.js"
        ),
        "mobile" => array(

        ),
        "tablet" => array(

        ),
        "desktop" => array(
            "common" => array(
                "controllers/dc-controller-slideshows-desktop.js",
                "directives/dc-directive-tooltip.js"
            ),
            "admin" => array(
                "models/dc-model-slideshow.js",
                "controllers/dc-controller-slideshows-desktop-admin.js",
                "directives/dc-directive-input.js"
            )
        )
    );

    public $_cssJSON = array(
        "common" => array(
            "directives/dc-directive-input.css",
            "directives/dc-directive-infinite-scroll.css"
        ),
        "mobile" => array(
            "common" => array(

            )
        ),
        "desktop" => array(
            "common" => array(
                "views/dc-slideshows-desktop.css",
                "views/subtemplates/dc-slideshow-search-item.css",
                "directives/dc-directive-tooltip.css"
            ),
            "admin" => array(
                "directives/dc-directive-modal.css",
                "directives/dc-directive-input.css"
            )
        )
    );

    public $_htmlJSON = array(
        "common" => array(
            'directives/dc-directive-infinite-scroll.html',
            'directives/dc-directive-input.html'
        ),
        "mobile" => array(
            "common" => array(

            )
        ),
        "tablet" => array(),
        "desktop" => array(
            "common" => array(
                'controllers/slideshows.html',
                '_subtemplates/dc-slideshow-search-item.html'
            ),
            "admin" => array(
                'directives/dc-directive-modal.html',
                '_subtemplates/dc-add-slideshow-modal.html'
            )
        )
    );

    function __construct()
    {
        // Call the Model constructor
        parent::__construct();
    }




}

?>