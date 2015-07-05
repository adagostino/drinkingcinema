<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');
    class slideshow_service extends CI_Model {
        private $_keyMap = array(
            "name" => "showUrl",
            "title" => "showTitle",
            "description" => "showDescription",
            "img" => "showImg",
            "slides" => "showSlides"
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
            $show = $this->get_show($name);
            $slideshow = null;
            if ($show) {
                $slideshow = $this->post_process_show($show);
            }
            return $slideshow;
        }

        function post_process_show($queryRow){
            if (!$queryRow) return null;
            $show = array();
            foreach ($this->_reverseKeyMap as $key => $value) {
                $show[$value] = htmlspecialchars_decode($queryRow->$key,ENT_QUOTES);
            }
            if ($this->config->item("is_local")) {
                $show["img"] = str_replace('/cdn.', '/cdn_local.', $show["img"]);
                $show["slides"] = str_replace('/cdn.', '/cdn_local.', $show["slides"]);
            }
            // unpack the slides
            $show["slides"] = json_decode($show["slides"]);
            return $show;
        }

        function upload_image($fileName, $name){
            return $this->image_service->upload_image($fileName, $this->globals->get_slideshow_dir());
        }

        function format_show($show){
            // next replace all image links in rules and optionalRules
            if (isset($show["description"])){
                $show["description"] = $this->image_service->upload_images_from_html($show["description"]);
            }
            if (isset($show["name"])) {
                $names = $this->format_name($show["name"] ? $show["name"] : $show["nameUrl"]);
                $show["name"] = $names["nameUrl"];
            } else {
                $num = $this->db->count_all('slideshowTable');
                $show["name"] = $this->image_service->alphaID($num,false,3,'party');
            }
            $is_local = $this->config->item('is_local');
            // pack the slides
            if (isset($show["slides"])) {
                $show["slides"] = json_encode($show["slides"]);
                if ($is_local) {
                    $show["slides"] = str_replace('/cdn_local.', '/cdn.', $show["slides"]);
                }
            }

            if (isset($show["img"]) && $is_local) {
                $show["img"] = str_replace('/cdn_local.', '/cdn.', $show["img"]);
            }

            return $show;
        }

        function format_name($name){
            $gameName = str_replace("+"," ", urldecode($name));
            $url = str_replace(" ","+",$gameName);
            return array(
                "name" => $gameName,
                "nameUrl" => $url
            );
        }

        function upload_show($show) {
            $show = $this->format_show($show);
            $data = array();
            $sql = "INSERT INTO slideshowTable (";
            $keys = "";
            $values = "";
            foreach ($show as $key => $value){
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
            return $show;
        }

        function update_show($show) {
            $show = $this->format_show($show);
            $sql = "UPDATE slideshowTable SET ";
            $kvps = "";
            $where = " WHERE showUrl=".$this->db->escape($show["name"]);
            foreach ($show as $key => $value) {
                if ($key !== "name" && $key !== "nameUrl") {
                    $dataKey = isset($this->_keyMap[$key]) ? $this->_keyMap[$key] : $key;
                    $kvps.= $kvps ? ", " : "";
                    $kvps.= $dataKey."=".$this->db->escape($value);
                }
            }
            if (!$kvps) return $show;
            $kvps.=", editDate=UTC_TIMESTAMP(), editUser=".$this->db->escape("admin");
            $sql.=$kvps.$where;
            $query = $this->db->query($sql);
            return $show;
        }

        function get_show($name, $params = 'showUrl, showTitle, showDescription, showImg, showSlides') {
            $showUrl = $this->format_name($name)["nameUrl"];
            $this->db->select($params);
            $query = $this->db->get_where('slideshowTable', array('showUrl' => $showUrl), 1);
            return $query->num_rows() > 0 ? $query->result()[0] : null;
        }
    }

?>