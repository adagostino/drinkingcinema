<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');
    include_once 'dependency.php';
    class game_dependency extends dependency {
        // create associative array to loop through to find the js associated with each page
        // split out first by common code over all pages, then each page
        // each page is split over common code for mobile and desktop, then mobile, then desktop
        // desktop is split for common code over desktop and then admin code
        public $_name = "game";
        public $_jsJSON = array(
            "common" => array(
                "models/dc-model-game.js",
                "models/dc-model-comments.js",
                "controllers/dc-controller-game.js",
                "controllers/dc-controller-comments.js",
                "directives/dc-directive-input.js",
                "directives/dc-directive-infinite-scroll.js",
                "directives/dc-directive-comment.js",
                "services/dc-service-data-source.js"
            ),
            "mobile" => array(
                "common" => array(
                    "controllers/dc-controller-game-mobile.js",
                    "directives/dc-directive-carousel.js"
                )
            ),
            "tablet" => array(
                "common" => array(
                    "directives/dc-directive-game-image.js",
                    "controllers/dc-controller-game-desktop.js",
                    "directives/dc-directive-embed-game.js"
                )
            ),
            "desktop" => array(
                "common" => array(
                    "directives/dc-directive-game-image.js",
                    "controllers/dc-controller-game-desktop.js",
                    "directives/dc-directive-embed-game.js",
                    "directives/dc-directive-tooltip.js",
                    "directives/dc-directive-tooltip-image.js"
                ),
                "admin" => array(
                    "models/dc-model-comments-admin.js",
                    "utilities/jquery.Jcrop.js",
                    "controllers/dc-controller-game-desktop-admin.js",
                    "controllers/dc-controller-comments-admin.js",
                    "directives/dc-directive-game-image-admin.js",
                    "directives/dc-directive-editable.js",
                    "directives/dc-directive-editable-rte.js",
                    "directives/dc-directive-upload-thumbnail.js",
                    "directives/dc-directive-upload-image.js",
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
                    "views/mobile/dc-game-mobile.css",
                    "views/mobile/dc-comments-mobile.css",
                    "directives/dc-directive-carousel.css",
                    "views/subtemplates/mobile/dc-game-suggestions-mobile.css",
                    "views/subtemplates/mobile/dc-comment-form-mobile.css",
                    "directives/mobile/dc-directive-comment-mobile.css"
                )
            ),
            "desktop" => array(
                "common" => array(
                    "views/dc-game-desktop.css",
                    "views/dc-comments-desktop.css",
                    "views/subtemplates/desktop/dc-comment-form-desktop.css",
                    "directives/dc-directive-game-image.css",
                    "directives/dc-directive-embed-game.css",
                    "directives/dc-directive-tooltip.css",
                    "directives/dc-directive-tooltip-image.css",
                    "directives/desktop/dc-directive-comment-desktop.css"
                ),
                "admin" => array(
                    "utilities/jcrop.css",
                    "directives/dc-directive-modal.css",
                    "directives/dc-directive-editable.css",
                    "directives/dc-directive-upload-thumbnail.css",
                    "directives/dc-directive-upload-image.css",
                    "views/subtemplates/desktop/dc-search-item-desktop.css"
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
                    'controllers/mobile/game-mobile.html',
                    'controllers/mobile/comments-mobile.html',
                    'directives/dc-directive-carousel.html',
                    '_subtemplates/mobile/dc-vendors-mobile.html',
                    '_subtemplates/mobile/dc-game-suggestions-mobile.html',
                    '_subtemplates/mobile/dc-comment-form-mobile.html',
                    '_subtemplates/mobile/dc-infinite-scroll-comments-mobile.html',
                    'directives/mobile/dc-directive-comment-mobile.html'
                )
            ),
            "tablet" => array(),
            "desktop" => array(
                "common" => array(
                    "controllers/game.html",
                    'controllers/comments.html',
                    'directives/dc-directive-search-input.html',
                    '_subtemplates/dc-share-input.html',
                    '_subtemplates/dc-game-desktop.html',
                    'directives/dc-directive-game-image.html',
                    'directives/dc-directive-embed-game.html',
                    '_subtemplates/dc-social-media.html',
                    '_subtemplates/dc-vendors-desktop.html',
                    '_subtemplates/dc-game-suggestions-desktop.html',
                    '_subtemplates/dc-comment-form-desktop.html',
                    'directives/dc-directive-tooltip.html',
                    '_subtemplates/dc-tooltip-text.html',
                    '_subtemplates/dc-tooltip-image.html',
                    '_subtemplates/dc-infinite-scroll-comments.html',
                    'directives/dc-directive-comment.html'
                ),
                "desktop" => array(
                    '_subtemplates/dc-infinite-scroll-comments.html'
                ),
                "admin" => array(
                    array(
                        "id" => 'dc-directive-game-image-admin-template',
                        "path" => 'directives/dc-directive-game-image-admin.html'
                    ),
                    'directives/dc-directive-editable.html',
                    'directives/dc-directive-modal.html',
                    'directives/dc-directive-editable-modal.html',
                    'directives/dc-directive-upload-thumbnail.html',
                    'directives/dc-directive-preview-thumbnail-modal.html',
                    'directives/dc-directive-upload-image.html',
                    'directives/dc-directive-preview-image-modal.html',
                    '_subtemplates/dc-search-item-desktop.html',
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