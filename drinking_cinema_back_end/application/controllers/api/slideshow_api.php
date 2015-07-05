<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');
    require APPPATH.'/libraries/REST_Controller.php';
    class Slideshow_api extends REST_Controller {
        function __construct() {
            parent::__construct();
            $this->load->model('slideshow_service');
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

        function slideshow_get() {
            // index.php/api/game_api/slideshow/name/Top+Gun
            $name = $this->get('name');

            $errors = array();
            $success = array();
            $input = array("name" => $name);
            if (!$name){
                $errors[] = "ESS_01";
            } else {
                $slideshow = $this->slideshow_service->get($name);
                if ($slideshow) {
                    $success = $slideshow;
                } else {
                    $errors[] = "ESS_02";
                }
            }
            $this->send($success, $errors, $input);
        }

        function slideshow_post() {
            if (!$this->is_admin()) return;
            $show = $this->post('slideshow', false);
            $input = $show;
            $success = array();
            $errors = array();
            $name = $show["name"];
            if ($name && $this->slideshow_service->get($name)) {
                $errors[] = "ESS_04";
            }

            if (empty($errors)){
                // submit the game
                $show = $this->slideshow_service->upload_show($show);
                if ($show) {
                    $success = $show;
                } else {
                    $errors[] = "ESS_03";
                }
            }
            $this->send($success,$errors,$input);
        }

        function slideshow_update_put() {
            if (!$this->is_admin()) return;
            $show = $this->put('slideshow', false);
            $input = $show;
            $success = array();
            $errors = array();
            if (!$show["name"]) {
                $errors[] = "ESS_01";
            }
            if (empty($errors)){
                $show = $this->slideshow_service->update_show($show);
                if ($show) {
                    $success = $show;
                } else {
                    $errors[] = "ESS_03";
                }
            }
            $this->send($success,$errors,$input);
        }

        function image_post() {
            if (!$this->is_admin()) return;
            $fileName = (isset($_SERVER['HTTP_X_FILENAME']) ? $_SERVER['HTTP_X_FILENAME'] : false);
            $name = $this->get('name');
            $input = array(
                "fileName" => $fileName,
                "name" => $name
            );
            $success = array();
            $errors = array();
            if (!$fileName){
                $errors[] = "EG_03";
            }
            if (!$name) {
                $errors[] = "EG_04";
            }

            if (empty($errors)){
                $image = $this->slideshow_service->upload_image($fileName, $name);
                if ($image){
                    if ($this->config->item("is_local")) {
                        $image = str_replace('http://cdn', 'http://cdn_local', $image);
                    }
                    $success = $image;
                } else {
                    $errors[] = "EG_05";
                }
            }
            $this->send($success, $errors, $input);

        }

        function test_get() {
            $slideshow = $this->slideshow_service->get("Party Up");
            echo json_encode($slideshow);
        }

    }

?>