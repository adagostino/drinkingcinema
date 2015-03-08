<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');
class Upload extends CI_Controller {
    function __construct() {
        parent::__construct();
    }

    function index() {
        $page = $this->page_service->get("upload", true);
        $page["title"] = "Upload";
        $page["isAdmin"] = true;
        $page["game"] = array(
            "name" => "",
            "nameUrl" => "",
            "tags" => "Set Tags Here",
            "rules" => "Set Mandatory Rules Here",
            "optionalRules" => "Set Optional Rules Here",
            "image" => "",
            "thumbnail" => $page["thumb"]
        );
        $page["subheader"] = "#dc-share-input-template";
        $page["share"] = array(
            'placeholder' => 'Set Movie Name'
        );
        $this->twiggy->set('page', $page)->template('upload')->display();
    }

}
?>