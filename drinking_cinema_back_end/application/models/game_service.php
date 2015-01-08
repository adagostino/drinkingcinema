<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');
    class game_service extends CI_Model {
        private $_keyMap = array(
            "name" => "movieName",
            "nameUrl" => "movieNameUrl",
            "rules" => "rulesHTML",
            "optionalRules" => "optionalRuleHTML"
        );


        function __construct() {
            // Call the Model constructor
            parent::__construct();
            $this->load->model('image_service');
            $this->load->database();
        }

        function get($name){
            return "Getting Game Name ".$name;
        }

        function upload_image($fileName, $name){
            return $this->image_service->upload_game($fileName, $name);
        }

        function upload_thumbnail($name, $coords) {
            $images = array();
            $images["thumbnail"] = $this->image_service->create_game_thumbnail($name, $coords, 60, "_thumb");
            $images["thumbnail_og"] = $this->image_service->create_game_thumbnail($name, $coords, 200, "_sn_thumb");
            $images["name"] = $name;
            $images["ext"] = "jpg";
            return $images;
        }

        function upload_game($game) {
            // first replace all image links in rules and optionalRules
            $game["rules"] = $this->image_service->upload_images_from_html($game["rules"]);
            $game["optionalRules"] = $this->image_service->upload_images_from_html($game["optionalRules"]);
            $data = array();
            foreach ($game as $key => $value){
                $dataKey = $this->_keyMap[$key] ? $this->_keyMap[$key] : $key;
                $data[$dataKey] = $value;
            }
            $data["uploadDate"] = "UTC_TIMESTAMP";
            $data["uploadUser"] = "admin";
            $this->db->insert('movieTable', $data);
            $id = $this->db->insert_id();
            return $game;
        }

        function uploadGame($movieName,$movieNameUrl,$rulesHTML,$optionalRulesHTML,$tags,$unm){
		$uploadUser = $unm;
		$sql = "INSERT INTO movieTable
				(movieName,movieNameUrl,rulesHTML,optionalRulesHTML,tags,uploadDate,uploadUser)
				VALUES (".$this->ci->db->escape($movieName).",".$this->ci->db->escape($movieNameUrl).","
				.$this->ci->db->escape($rulesHTML).",".$this->ci->db->escape($optionalRulesHTML).","
				.$this->ci->db->escape($tags).",UTC_TIMESTAMP,".$this->ci->db->escape($uploadUser).")";
		$query = $this->ci->db->query($sql);
		$id = $this->ci->db->insert_id();
		$this->removeAllSuggestionCache();
		$this->removeAllSearchesCache();
		$this->removeMovieCache($movieNameUrl);
		$this->removeMovieCache($movieNameUrl."+Admin");
		$this->search("newest");
		return "success";
	}


    }

?>