<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');
    include_once 'dependency.php';
    class page_dependency extends dependency {
        // create associative array to loop through to find the js associated with each page
        // split out first by common code over all pages, then each page
        // each page is split over common code for mobile and desktop, then mobile, then desktop
        // desktop is split for common code over desktop and then admin code
        public $_name = "page";
        public $_jsJSON = array(
            "common" => array(
                "models/dc-model-page.js",
                "models/dc-model-comments.js",
                "controllers/dc-controller-page.js",
                "controllers/dc-controller-comments.js",
                "directives/dc-directive-input.js",
                "directives/dc-directive-infinite-scroll.js",
                "directives/dc-directive-comment.js",
                "services/dc-service-data-source.js"
            ),
            "mobile" => array(
                "common" => array(
                    "controllers/dc-controller-page-mobile.js"
                )
            ),
            "tablet" => array(
                "common" => array(
                    "controllers/dc-controller-page-desktop.js"
                )
            ),
            "desktop" => array(
                "common" => array(
                    "controllers/dc-controller-page-desktop.js",
                    "directives/dc-directive-tooltip.js",
                    "directives/dc-directive-tooltip-image.js"
                ),
                "admin" => array(
                    "models/dc-model-comments-admin.js",
                    "controllers/dc-controller-page-desktop-admin.js",
                    "controllers/dc-controller-comments-admin.js",
                    "directives/dc-directive-editable.js",
                    "directives/dc-directive-editable-rte.js",
                    "directives/dc-directive-comment-admin.js"
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
                    "views/mobile/dc-page-mobile.css",
                    "views/mobile/dc-comments-mobile.css",
                    "views/subtemplates/mobile/dc-comment-form-mobile.css",
                    "directives/mobile/dc-directive-comment-mobile.css"
                )
            ),
            "desktop" => array(
                "common" => array(
                    "views/dc-page-desktop.css",
                    "views/dc-comments-desktop.css",
                    "views/subtemplates/desktop/dc-additional-pages-subheader-desktop.css",
                    "views/subtemplates/desktop/dc-comment-form-desktop.css",
                    "directives/dc-directive-tooltip.css",
                    "directives/dc-directive-tooltip-image.css",
                    "directives/desktop/dc-directive-comment-desktop.css"
                ),
                "admin" => array(
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
                    'controllers/mobile/page-mobile.html',
                    'controllers/mobile/comments-mobile.html',
                    '_subtemplates/mobile/dc-comment-form-mobile.html',
                    '_subtemplates/mobile/dc-infinite-scroll-comments-mobile.html',
                    'directives/mobile/dc-directive-comment-mobile.html'
                )
            ),
            "tablet" => array(),
            "desktop" => array(
                "common" => array(
                    'controllers/page.html',
                    'controllers/comments.html',
                    'directives/dc-directive-search-input.html',
                    '_subtemplates/dc-share-input.html',
                    '_subtemplates/dc-additional-pages-subheader.html',
                    '_subtemplates/dc-social-media.html',
                    '_subtemplates/dc-comment-form-desktop.html',
                    'directives/dc-directive-tooltip.html',
                    '_subtemplates/dc-tooltip-image.html',
                    'directives/dc-directive-comment.html',
                    '_subtemplates/dc-infinite-scroll-comments.html'
                ),
                "admin" => array(
                    'directives/dc-directive-editable.html',
                    'directives/dc-directive-modal.html',
                    'directives/dc-directive-editable-modal.html',
                    '_subtemplates/dc-infinite-scroll-comments-admin.html',
                    '_subtemplates/dc-remove-comment-modal.html'
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