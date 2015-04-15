<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');
    include_once 'dependency.php';
    class upload_dependency extends dependency {
        // create associative array to loop through to find the js associated with each page
        // split out first by common code over all pages, then each page
        // each page is split over common code for mobile and desktop, then mobile, then desktop
        // desktop is split for common code over desktop and then admin code
        public $_name = "upload";
        public $_jsJSON = array(
            "common" => array(
                "models/dc-model-game.js"
            ),
            "mobile" => array(),
            "tablet" => array(),
            "desktop" => array(
                "common" => array(
                ),
                "admin" => array(
                    "utilities/jquery.Jcrop.js",
                    "controllers/dc-controller-upload.js",
                    "directives/dc-directive-editable.js",
                    "directives/dc-directive-editable-rte.js",
                    "directives/dc-directive-game-image.js",
                    "directives/dc-directive-game-image-admin.js",
                    "directives/dc-directive-upload-thumbnail.js",
                    "directives/dc-directive-upload-image.js",
                    "directives/dc-directive-embed-game.js"
                )
            )
        );

        public $_cssJSON = array(
            "common" => array(
                "directives/dc-directive-input.css"
            ),
            "mobile" => array(),
            "desktop" => array(
                "common" => array(
                    "views/dc-game-desktop.css",
                    "views/dc-upload-desktop.css",
                    "directives/dc-directive-embed-game.css"
                ),
                "admin" => array(
                    "utilities/jcrop.css",
                    "directives/dc-directive-modal.css",
                    "directives/dc-directive-editable.css",
                    "directives/dc-directive-game-image.css",
                    "directives/dc-directive-upload-thumbnail.css",
                    "directives/dc-directive-upload-image.css",
                    "directives/dc-directive-input.css",
                    "views/subtemplates/desktop/dc-search-item-desktop.css"
                )
            )
        );

        public $_htmlJSON = array(
            "common" => array(),
            "mobile" => array(),
            "tablet" => array(),
            "desktop" => array(
                "common" => array(
                ),
                "desktop" => array(
                ),
                "admin" => array(
                    "controllers/upload.html",
                    'controllers/comments.html',
                    'directives/dc-directive-search-input.html',
                    '_subtemplates/dc-share-input.html',
                    '_subtemplates/dc-game-desktop.html',
                    '_subtemplates/dc-upload-game-modal.html',
                    'directives/dc-directive-editable.html',
                    'directives/dc-directive-modal.html',
                    'directives/dc-directive-editable-modal.html',
                    'directives/dc-directive-search-input.html',
                    'directives/dc-directive-upload-thumbnail.html',
                    'directives/dc-directive-preview-thumbnail-modal.html',
                    'directives/dc-directive-upload-image.html',
                    'directives/dc-directive-preview-image-modal.html',
                    '_subtemplates/dc-search-item-desktop.html',
                    'directives/dc-directive-game-image.html',
                    'directives/dc-directive-embed-game.html',
                    array(
                        "id" => 'dc-directive-game-image-admin-template',
                        "path" => 'directives/dc-directive-game-image-admin.html'
                    )
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