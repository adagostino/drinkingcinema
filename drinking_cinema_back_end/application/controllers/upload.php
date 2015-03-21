<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');
class Upload extends CI_Controller {
    function __construct() {
        parent::__construct();
        $this->load->library('tank_auth');
    }

    function index() {
        $isAdmin = $this->tank_auth->is_admin();
        if (!$isAdmin){
            return show_404();
        }
        $page = $this->page_builder_service->get_data("upload");
        $page["title"] = "Upload";
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