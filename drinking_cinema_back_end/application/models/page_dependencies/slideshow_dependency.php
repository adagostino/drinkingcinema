<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');
include_once 'dependency.php';
class slideshow_dependency extends dependency {
    // create associative array to loop through to find the js associated with each page
    // split out first by common code over all pages, then each page
    // each page is split over common code for mobile and desktop, then mobile, then desktop
    // desktop is split for common code over desktop and then admin code
    public $_name = "game";
    public $_jsJSON = array(
        "common" => array(
            "controllers/dc-controller-slideshow.js"
        ),
        "mobile" => array(

        ),
        "tablet" => array(

        ),
        "desktop" => array(
            "common" => array(
                "controllers/dc-controller-slideshow-desktop.js",
                "directives/dc-directive-tooltip.js"
            ),
            "admin" => array(
                "models/dc-model-slideshow.js",
                "controllers/dc-controller-slideshow-desktop-admin.js",
                "directives/dc-directive-input.js",
                "directives/dc-directive-editable.js",
                "directives/dc-directive-editable-rte.js"
            )
        )
    );

    public $_cssJSON = array(
        "common" => array(
            "directives/dc-directive-input.css"
        ),
        "mobile" => array(
            "common" => array(

            )
        ),
        "desktop" => array(
            "common" => array(
                "views/dc-slideshow-desktop.css",
                "directives/dc-directive-tooltip.css"
            ),
            "admin" => array(
                "directives/dc-directive-input.css",
                "directives/dc-directive-modal.css",
                "directives/dc-directive-editable.css"
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
                'controllers/slideshow.html',
            ),
            "desktop" => array(
                '_subtemplates/dc-slideshow.html'
            ),
            "admin" => array(
                array(
                    "id" => 'dc-slideshow-admin-template',
                    "path" => '_subtemplates/dc-slideshow-admin.html'
                ),
                'directives/dc-directive-editable.html',
                'directives/dc-directive-modal.html',
                'directives/dc-directive-editable-modal.html'
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