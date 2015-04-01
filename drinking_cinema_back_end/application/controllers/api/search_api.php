<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');
require APPPATH.'/libraries/REST_Controller.php';
class Search_api extends REST_Controller {

    private function send($success, $errors, $input) {
        if (empty($errors)){
            $this->response($success, 200);
        } else {
            $error = $this->error_service->get($errors, $input);
            $this->response($error, $error["code"]);
        }
    }

    private function search($type, $searchTerms = null, $offset = null, $limit = null){
        $searchTerms = isset($searchTerms) ? $searchTerms : $this->post('searchTerms');
        $offset = isset($offset) ? $offset : $this->post('offset');
        $limit = isset($limit) ? $limit : $this->post('limit');
        $errors = array();
        if (!$this->form_validation->is_numeric($offset)) $errors[] = "ES_01";
        if (!$this->form_validation->is_numeric($limit)) $errors[] = "ES_02";
        $success = array();
        $input = array('searchTerms' => $searchTerms, 'offset'=>$offset, 'limit'=>$limit);
        if (empty($errors)){
            $fn = "search_".$type;
            $results = $this->search_service->$fn($searchTerms,$offset,$limit);
            if (is_array($results)){ // use is_array b/c [] is falsey
                $success = $results;
            } else {
                $errors[] = "ES_10";
            }
        }
        $this->send($success,$errors,$input);
    }

    function __construct() {
        parent::__construct();
        $this->load->library('form_validation');
        $this->load->database();
        $this->load->model('search_service');
        $this->load->model('error_service');
    }

    function search_games_post(){
        $this->search("movies");
    }

    function test_get(){

    }
}

?>