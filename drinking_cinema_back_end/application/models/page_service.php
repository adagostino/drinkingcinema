<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');
    class page_service extends CI_Model {
        private $_keyMap = array(
            "pageName" => "page",
            "content" => "content"
        );

        function __construct()
        {
            // Call the Model constructor
            parent::__construct();
            $this->load->model('image_service');
            $this->load->database();
        }

        // comment home is the unique url where it lives
        function format_page_name($pageName){
            $page = trim(urldecode(strtolower($pageName)));
            $name = str_replace("+"," ", $page);
            $url = str_replace(" ","+", $name);
            return $url;
        }

        function format_input_opts($opts){
            $a = array();
            foreach ($this->_keyMap as $key=>$value){
                // key is what is passed in, value is what that maps to in the db
                if (isset($opts[$key])) {
                    switch($value){
                        case "page":
                            $a[$value] = $this->format_page_name($opts[$key]);
                            break;
                        case "content":
                            $a[$value] = $this->image_service->upload_images_from_html($opts[$key]);
                            break;
                        default:
                            $a[$key] = $opts[$key];
                            break;
                    }
                }
            }
            return $a;
        }

        function post_process_page($input, $isQuery = false){
            $page = array();
            foreach ($this->_keyMap as $key => $value) {
                $page[$key] = $isQuery ? htmlspecialchars_decode($input->$value,ENT_QUOTES) : $input[$value];
            }
        }

        function get($pageName){
            $pageNameLower= $this->format_page_name($pageName);
            $this->db->select("*");
            $query = $this->db->get_where('pageTable', array('page' => $pageNameLower), 1);
            return $query->num_rows() > 0 ? $this->post_process_page($query->result()[0], true) : array("pageName" => $pageName, "content"=>"Set ".$pageName." Content");
        }

        function update_page($opts){
            //INSERT INTO table (id, name, age) VALUES(1, "A", 19) ON DUPLICATE KEY UPDATE name=VALUES(name), age=VALUES(age)
            $input = $this->format_input_opts($opts);
            $insert = "INSERT INTO pageTable (";
            $values = " (";
            $update = " ON DUPLICATE KEY UPDATE ";
            $ct = 0;
            foreach ($input as $key){
                if ($ct > 0){
                    $insert.=",";
                    $values.=",";
                    $update.=",";
                }
                $insert.=$key;
                $values.=$this->db->escape($input[$key]);
                $update.=$key."=VALUES(".$key.")";
                $ct++;
            }
            $insert.=",editUser)";
            $values.=$this->db->escape("admin").")";
            $update.=",editUser=VALUES(editUser)";
            $sql=$insert.$values.$update;
            $query = $this->db->query($sql);
            return $this->post_process_page($input);
        }


    }
?>