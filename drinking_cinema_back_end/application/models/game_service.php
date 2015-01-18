<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');
    class game_service extends CI_Model {
        private $_keyMap = array(
            "name" => "movieName",
            "nameUrl" => "movieNameUrl",
            "rules" => "rulesHTML",
            "optionalRules" => "optionalRulesHTML",
            "tags" => "tags"
        );
        private $_reverseKeyMap = array();



        function __construct() {
            // Call the Model constructor
            parent::__construct();
            $this->load->model('image_service');
            $this->load->database();
            foreach ($this->_keyMap as $key => $value){
                $this->_reverseKeyMap[$value] = $key;
            }
        }

        function get($name){
            $gameRow = $this->get_movie($name);
            if (!$gameRow) return null;

            $game = array();
            foreach ($this->_reverseKeyMap as $key => $value) {
                $game[$value] = htmlspecialchars_decode($gameRow->$key,ENT_QUOTES);
            }
            $game["tags"] = trim($game["tags"]," \t\n\r\0\x0B\,");
            if ($game) {
                $game["suggestions"] = $this->get_suggestions_for_movie($game["nameUrl"], $game["tags"]);
                $game["imageBase"] =  str_replace("../","http://",$this->globals->get_games_dir().$game["nameUrl"]);
                $game["image"] = $game["imageBase"]."_large.jpg";
                $game["thumbnail"] = $game["imageBase"]."_thumb.jpg";
            }
            return $game;
        }

        function upload_image($fileName, $name){
            $name = $this->format_game_name($name)["nameUrl"];
            return $this->image_service->upload_game($fileName, $name);
        }

        function upload_thumbnail($name, $coords) {
            $name = $this->format_game_name($name)["nameUrl"];
            $images = array();
            $images["thumbnail"] = $this->image_service->create_game_thumbnail($name, $coords, 60, "_thumb");
            $images["thumbnail_og"] = $this->image_service->create_game_thumbnail($name, $coords, 200, "_sn_thumb");
            $images["name"] = $name;
            $images["ext"] = "jpg";
            return $images;
        }

        function format_game_name($name){
            $gameName = str_replace("+"," ", urldecode($name));
            $url = str_replace(" ","+",$gameName);
            return array(
                "name" => $gameName,
                "nameUrl" => $url
            );
        }

        function format_game($game){
            // first format the tags so they can be searched for suggestions later (very crude - should be its own table)
            if (isset($game["tags"])) {
                $tags = explode(",", $game["tags"]);
                $tagStr = "";
                foreach ($tags as $tag) {
                    $tag = trim($tag);
                    if ($tag) {
                        $tagStr .= $tagStr ? "," : "";
                        $tagStr .= $tag;
                    }
                }
                $game["tags"] = "," . $tagStr . ",";
            }

            // next replace all image links in rules and optionalRules
            if (isset($game["rules"])){
                $game["rules"] = $this->image_service->upload_images_from_html($game["rules"]);
            }
            if (isset($game["optionalRules"])){
                $game["optionalRules"] = $this->image_service->upload_images_from_html($game["optionalRules"]);
            }

            $names = $this->format_game_name($game["name"] ? $game["name"] : $game["nameUrl"]);
            $game["name"] = $names["name"];
            $game["nameUrl"] = $names["nameUrl"];
            return $game;
        }

        function upload_game($game) {
            $game = $this->format_game($game);
            $data = array();
            $sql = "INSERT INTO movieTable (";
            $keys = "";
            $values = "";
            foreach ($game as $key => $value){
                $dataKey = isset($this->_keyMap[$key]) ? $this->_keyMap[$key] : $key;
                $data[$dataKey] = $value;
                $keys.= $keys ? "," : "";
                $values.= $values ? ",": "";
                $keys.=$dataKey;
                $values.= $this->db->escape($value);
            }
            $data["uploadDate"] = "UTC_TIMESTAMP";
            $data["uploadUser"] = "admin";

            $keys.= ",uploadDate, uploadUser";
            $values.=",UTC_TIMESTAMP,".$this->db->escape("admin");
            $sql.=$keys.") VALUES (".$values.")";
            $query = $this->db->query($sql);
            $id = $this->db->insert_id();
            return $game;
        }

        function update_game($game) {
            $game = $this->format_game($game);
            $sql = "UPDATE movieTable SET ";
            $kvps = "";
            $where = " WHERE movieNameUrl=".$this->db->escape($game["nameUrl"]);
            foreach ($game as $key => $value) {
                if ($key !== "name" && $key !== "nameUrl") {
                    $dataKey = isset($this->_keyMap[$key]) ? $this->_keyMap[$key] : $key;
                    $kvps.= $kvps ? ", " : "";
                    $kvps.= $dataKey."=".$this->db->escape($value);
                }
            }
            if (!$kvps) return $game;
            $kvps.=", editDate=UTC_TIMESTAMP(), editUser=".$this->db->escape("admin");
            $sql.=$kvps.$where;
            $query = $this->db->query($sql);
            if (isset($game["tags"])) $game["tags"] = trim($game["tags"]," \t\n\r\0\x0B\,");

            return $game;

        }

        function get_movie($name,$params = 'movieName, movieNameUrl, tags, rulesHTML, optionalRulesHTML') {
            $nameUrl = $this->format_game_name($name)["nameUrl"];
            $this->db->select($params);
            $query = $this->db->get_where('movieTable', array('movieNameUrl' => $nameUrl), 1);
            return $query->num_rows() > 0 ? $query->result()[0] : null;
        }

        function get_suggestions_for_movie($nameUrl, $tags = null, $maxResults = 10){
            $tags = $tags ? $tags : $this->get_movie($nameUrl,'tags');
            if (!$tags) return;
            $tagArray = explode(",", $tags);
            $movieNameUrl = $this->db->escape($nameUrl);
            $sql1 = "SELECT movieNameUrl, SUM(matchCount) AS count FROM(";
            $sql2 = "";
            foreach ($tagArray as $tag) {
                $t = $this->db->escape(trim($tag));
                if ($tag){
                    $sql2.= $sql2 ? " UNION " : "";
                    $sql2.= "SELECT movieNameUrl,".$t." AS tag, 1 as matchCount FROM movieTable WHERE tags LIKE '%,".$tag.",%' AND movieNameUrl <> ".$movieNameUrl;
                }
            }
            $sql3 = ") a GROUP BY movieNameUrl ORDER BY count DESC";
            $sql3.= $maxResults ? " LIMIT ".$maxResults : "";
            $sql = $sql1.$sql2.$sql3;
            $query = $this->db->query($sql);
            $suggestions = array();
            foreach ($query->result() as $row){
                $suggestions[] =  htmlspecialchars_decode($row->movieNameUrl,ENT_QUOTES);
            }
            return $suggestions;
        }

    }

?>