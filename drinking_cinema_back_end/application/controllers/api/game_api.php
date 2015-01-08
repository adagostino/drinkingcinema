<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');
    require APPPATH.'/libraries/REST_Controller.php';
    class Game_api extends REST_Controller {
        function __construct() {
            parent::__construct();
            $this->load->model('game_service');
            $this->load->model('error_service');
            $this->load->library('tank_auth');
        }

        private function is_admin() {
            $isAdmin = $this->tank_auth->is_admin();
            if (!$isAdmin) $this->send(array(), array("E_01"), array());
            return $isAdmin;
        }

        private function format_game_name($name){
            $gameName = str_replace("+"," ", urldecode($name));
            $url = str_replace(" ","+",$gameName);
            return array(
                "name" => $gameName,
                "url" => $url
            );
        }

        private function send($success, $errors, $input) {
            if (empty($errors)){
                $this->response($success, 200);
            } else {
                $error = $this->error_service->get($errors, $input);
                $this->response($error, $error["code"]);
            }
        }

        function game_get() {
            // index.php/api/game_api/game/name/Top+Gun
            $name = $this->get('name');

            $errors = array();
            $success = array();
            $input = array("name" => $name);
            if (!$name){
                $errors[] = "EG_01";
            } else {
                $nameUrl = $this->format_game_name($name)["url"];
                $game = $this->game_service->get($nameUrl);
                if ($game) {
                    $success = $game;
                } else {
                    $errors[] = "EG_02";
                }
            }
            $this->send($success, $errors, $input);
        }

        function game_post() {
            $game = $this->post('game');
            $input = $game;
            $success = array();
            $errors = array();
            if ($game["name"]) {
                $formatted_names = $this->format_game_name($game["name"]);
                $game["name"] = $formatted_names["name"];
                $game["nameUrl"] = $formatted_names["url"];
            } else {
                $errors[] = "EG_01";
            }
            if (!$game["rules"]){
                $errors[] = "EG_09";
            }
            if (!$game["optionalRules"]){
                $errors[] = "EG_10";
            }
            if (!$game["tags"]){
                $errors[] = "EG_11";
            }

            if (empty($errors)){
                // submit the game
                $game = $this->$game_service->upload_game($game);
                if ($game) {
                    $success = $game;
                } else {
                    $errors[] = "EG_12";
                }
            }
            $this->send($success,$errors,$input);

        }

        function image_post() {
            //if (!is_admin()) return;
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
                $nameUrl = $this->format_game_name($name)["url"];
                $images = $this->game_service->upload_image($fileName, $nameUrl);
                if ($images){
                    $success = $images;
                } else {
                    $errors[] = "EG_05";
                }
            }
            $this->send($success, $errors, $input);

        }

        function thumbnail_post() {
            $name = $this->post('name');
            $coords = $this->post('coords');
            $input = array(
                "name" => $name,
                "coords" => $coords
            );
            $errors = array();
            $success = array();

            if (!$name) {
                $errors[] = "EG_06";
            }
            if (!$coords) {
                $errors[] = "EG_07";
            }

            if (empty($errors)){
                if ($coords["w"]) {
                    $nameUrl = $this->format_game_name($name)["url"];
                    $images = $this->game_service->upload_thumbnail($nameUrl, $coords);
                    if ($images) {
                        $success = $images;
                    } else {
                        $errors[] = "EG_05";
                    }
                } else {
                    $errors[] = "EG_08";
                }
            }
            $this->send($success, $errors, $input);
        }


        function test_get(){

            $url = "http://www.kaieteurnewsonline.com/images/2009/12/jamzone_girls.jpg";
            //$url = "http://cdn.drinkingcinema.com/uli/66M.jpeg";
            $start = time();
            if ($ext = $this->image_service->is_image(null)){
                echo "is image ".$ext;
            } else {
                echo "not image ".$ext;
            };
            return;
            $fname = $this->image_service->getImage($url, $ext);
            $end = time();

            echo ($end - $start)." , ".$fname;

            //$finfo = $this->image_service->get_file_info_from_url($url);
            //$ulFileName = $this->image_service->getFileName($finfo["name"],$finfo["ext"]);
            //echo $ulFileName;
            //echo $uli;

        }


    }

?>