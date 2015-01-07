<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');
    class error_service extends CI_Model {
        private $errors = array(
            // Generic error
            "E_00" => array(
                "message" => "There was an error but the code used was not found, so this is just generic",
                "code" => 500
            ),
            "E_01" => array(
                "message" => "Permission denied. The user is not an admin.",
                "code" => 403
            ),
            // Game_api erros
            "EG_01" => array(
                "message" => "No game name given.",
                "code" => 400
            ),
            "EG_02" => array(
                "message" => "Game not found.",
                "code" => 404
            ),
            "EG_03" => array(
                "message" => "Please provide a file to upload.",
                "code" => 400
            ),
            "EG_04" => array(
                "message" => "Please provide a file name for the file to upload.",
                "code" => 400
            ),
            "EG_05" => array(
                "message" => "There was a problem uploading your file. Please try again.",
                "code" => 500
            ),
            "EG_06" => array(
                "message" => "Please provide the name of file of which you'd like to make a thumbnail.",
                "code" => 400
            ),
            "EG_07" => array(
                "message" => "Please provide the coordinates for the thumbnail.",
                "code" => 400
            ),
            "EG_08" => array(
                "message" => "Please provide a width greater than 0 for the thumbnail.",
                "code" => 400
            ),
            "EG_09" => array(
                "message" => "Please provide rules for the game you'd like to upload/edit",
                "code" => 400
            ),
            "EG_10" => array(
                "message" => "Please provide optional rules for the game you'd like to upload/edit",
                "code" => 400
            ),
            "EG_11" => array(
                "message" => "Please provide tags for the game you'd like to upload/edit",
                "code" => 400
            ),
            "EG_12" => array(
                "message" => "There was a DB error uploading/editing your game",
                "code" => 500
            )
        );

        function __construct() {
            // Call the Model constructor
            parent::__construct();
        }

        function get_error($code) {
            $e = array_key_exists($code, $this->errors) ? $this->errors[$code] : $this->errors["E_00"];
            $e["error_code"] = $code;
            return $e;
        }

        function get($codes, $input) {
            $error = array("input" => $input, "errors" => array(), "code" => -1);
            $defaultCode = 500;
            foreach ($codes as $key) {
                $e = $this->get_error($key);
                $error["errors"][] = $e;
                if ($error["code"] === -1) {
                    $error["code"] = $e["code"];
                } else {
                    $error["code"] = $error["code"] === $e["code"] ? $error["code"] : $defaultCode;
                }
            }
            return $error;
        }

    }

?>