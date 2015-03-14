<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');
    require APPPATH.'/libraries/REST_Controller.php';
    class Page_api extends REST_Controller {
        function __construct() {
            parent::__construct();
            $this->load->model('page_service');
            $this->load->model('error_service');
            $this->load->library('tank_auth');
        }

        private function is_admin() {
            $isAdmin = $this->tank_auth->is_admin();
            if (!$isAdmin) $this->send(array(), array("E_01"), array());
            return $isAdmin;
        }

        private function send($success, $errors, $input) {
            if (empty($errors)){
                $this->response($success, 200);
            } else {
                $error = $this->error_service->get($errors, $input);
                $this->response($error, $error["code"]);
            }
        }


        function page_update_post() {
            if (!$this->is_admin()) return;
            $page = $this->post('page');
            $errors = array();
            $success = array();
            $input = array('page'=> $page);
            if (!$page["pageName"]) {
                $errors[] = "EP_01";
            }
            if (empty($errors)){
                $page = $this->page_service->update_page($page);
                if ($page) {
                    $success = $page;
                } else {
                    $errors[] = "EP_02";
                }
            }
            $this->send($success,$errors,$input);

        }

        function test_get(){

        }

    }

?>