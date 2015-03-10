<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');
    class page_service extends CI_Model {
        private $_nav_bar_links = array(
            array(
                'name' => 'faq',
                'href' => '/faq',
                'hasX' => true
            ),
            array(
                'name' => 'about',
                'href' => '/about',
                'hasX' => true
            ),
            array(
                'name' => 'contact',
                'href' => '/contact',
                'hasX' => true
            ),
            array(
                'name' => 'follow'
            ),
            array(
                'name' => 'twitter',
                'href' => 'http://twitter.com/drinkingcinema',
                'target'=> '_blank'
            ),
            array(
                'name' => 'facebook',
                'href' => 'http://www.facebook.com/DrinkingCinema',
                'target'=> '_blank'
            ),
        );

        private $_keyMap = array(
            "pageName" => "page",
            "content" => "content"
        );

        function __construct()
        {
            // Call the Model constructor
            parent::__construct();
            $this->load->library('tank_auth');
            $this->load->model('image_service');
            $this->load->database();
        }

        function get_data($pageName, $isAdmin = false, $game = null){
            if ($this->tank_auth->is_admin()){
                // do some stuff -- or don't!!
                //echo $this->tank_auth->get_username()." is an admin";
            }
            $scripts = $this->script_service->getScripts($pageName, "desktop", $isAdmin);
            $page = array(
                'javascripts' => $scripts['js'],
                'stylesheets' => $scripts['css'],
            );
            $socialMedia = $this->social_media_service->get($pageName, $game);
            foreach ($socialMedia as $key => $value){
                $page[$key] = $value;
            }
            $page["navBarLinks"] = $this->_nav_bar_links;
            $page["headerSize"] = $pageName === "game" ? "medium" : "large";
            return $page;
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

        function get($pageName, $isAdmin = false){
            $sql = "";
            $query = $this->db->query($sql);
            return $query->num_rows() > 0 ? $this->post_process_page($query->result()[0], true) : array("pageName" => $pageName, "content"=>"");
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