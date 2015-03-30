<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');
class version_service extends CI_Model {
    private $_keyMap = array(
        "game" => "movieTable",
        "comments" => "commentsTable"
    );
    private $_reverseKeyMap = array();

    function __construct() {
        // Call the Model constructor
        parent::__construct();
        $this->load->database();
        $this->load->model('image_service');
        foreach ($this->_keyMap as $key => $value){
            $this->_reverseKeyMap[$value] = $key;
        }
    }

    function generate_version($tableName) {
        $ts = preg_replace('/000000/', preg_replace('/(?:0.)([^\s]+)(?:.*)/','$1',microtime()) , date('mdYHisu'));
        return $this->image_service->alphaID($ts, $to_num = false, $pad_up = false, $tableName.$ts);
    }

    function update_version($key){
        if (!isset($this->_keyMap[$key])) return;
        $tableName = $this->_keyMap[$key];

        $insert = "INSERT INTO versionTable (tableName, version)";
        $values = " VALUES(";
        $values.= $this->db->escape($tableName).",";
        $values.= $this->db->escape($this->generate_version($tableName));
        $values.=")";
        $update = " ON DUPLICATE KEY UPDATE ";
        $update.= "tableName=VALUES(tableName), version=VALUES(version)";
        $sql=$insert.$values.$update;
        $query = $this->db->query($sql);
    }

    function get_versions(){
        $query = $this->db->get('versionTable');
        $a = array();
        foreach ($query->result() as $row)
        {
            if (isset($this->_reverseKeyMap[$row->tableName])){
                $a[$this->_reverseKeyMap[$row->tableName]] = $row->version;
            }
        }
        foreach ($this->_keyMap as $key => $value){
            if (!isset($a[$key])){
                $a[$key] = "initial";
            }
        }
        return $a;
    }

}

?>