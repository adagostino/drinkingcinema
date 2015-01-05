<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');
    require APPPATH.'/libraries/REST_Controller.php';
    class Game_api extends REST_Controller {
        function __construct() {
            parent::__construct();
            $this->load->model('game_service');
        }

        function game_get() {
            // index.php/api/game_api/game/name/Top+Gun
            $name = $this->get('name');
            if (!$name){
                $this->response(NULL, 400);
            }
            $game = $this->game_service->get($name);
            if ($game) {
                $this->response(array('game'=> $game), 200);
            } else {
                $this->response(array('error' => 'Game could not be found'), 404);
            }
        }

        function game_post() {

        }

        function image_post() {
            $fileName = (isset($_SERVER['HTTP_X_FILENAME']) ? $_SERVER['HTTP_X_FILENAME'] : false);
            if ($fileName){
                $images = $this->game_service->upload_image($fileName);
                $this->response($images, 200);
            } else {

            }
        }

        function thumbnail_post() {

        }



    }

?>