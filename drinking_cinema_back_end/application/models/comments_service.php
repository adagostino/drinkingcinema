<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');
class comments_service extends CI_Model {
    private $_keyMap = array(
        "name" => "userName",
        "email" => "userEmail",
        "comment" => "userComment",
        "flagged" => "flagged"
    );

    private $_reverseKeyMap = array();

    function __construct() {
        // Call the Model constructor
        parent::__construct();
        $this->load->model('scrubber_service');
        $this->load->database();
        foreach ($this->_keyMap as $key => $value){
            $this->_reverseKeyMap[$value] = $key;
        }
    }

    // comment home is the unique url where it lives
    function format_comment_home($commentHome){
        $name = str_replace("+"," ", urldecode($commentHome));
        $url = str_replace(" ","+", $name);
        return $url;
    }

    function format_comment($comment){
        if (isset($comment["comment"])){
            $comment["comment"] = $this->scrubber_service->scrub($comment["comment"]);
        }
    }

    function upload_comment($commentHome, $comment){
        $commentHome = $this->format_comment_home($commentHome);
        $this->format_comment($comment);
        $data = array();
        $sql = "INSERT INTO commentsTable (";
        $keys = "";
        $values = "";
        foreach ($comment as $key => $value){
            $dataKey = isset($this->_keyMap[$key]) ? $this->_keyMap[$key] : $key;
            $data[$dataKey] = $value;
            $keys.= $keys ? "," : "";
            $values.= $values ? ",": "";
            $keys.=$dataKey;
            $values.= $this->db->escape($value);
        }
        $data["uploadDate"] = "UTC_TIMESTAMP";
        $data["subjectId"] = $commentHome;
        $keys.= ",uploadDate, subjectId";
        $values.=",UTC_TIMESTAMP,".$this->db->escape($commentHome);
        $sql.=$keys.") VALUES (".$values.")";
        $query = $this->db->query($sql);
        $id = $this->db->insert_id();
        return $comment;
    }

    function update_comment($commentId, $comment) {
        $comment = $this->format_comment($comment);
        $sql = "UPDATE commentsTable SET ";
        $kvps = "";
        $where = " WHERE p_Id=".$this->db->escape($commentId);
        foreach ($comment as $key => $value) {
            $dataKey = isset($this->_keyMap[$key]) ? $this->_keyMap[$key] : $key;
            $kvps.= $kvps ? ", " : "";
            $kvps.= $dataKey."=".$this->db->escape($value);
        }
        if (!$kvps) return $comment;
        $kvps.=", editDate=UTC_TIMESTAMP(), editUser=".$this->db->escape("admin");
        $sql.=$kvps.$where;
        $query = $this->db->query($sql);

        return $comment;

    }

    function flag_comment($commentId) {

    }

    function remove_comment($commentId) {

    }

    function format_output_comment($c){
        $comment = array();
        foreach ($c as $key=>$value){
            $newKey = isset($this->_reverseKeyMap[$key]) ? $this->_reverseKeyMap[$key] : $key;
            $comment[$newKey] = htmlspecialchars_decode($value, ENT_QUOTES);
        }
        return $comment;
    }

    function get_comments($commentHome, $increment, $lastCommentDate = null, $isAdmin = true){
        $commentHome = $this->format_comment_home($commentHome);
        $selectors = "p_Id, uploadDate, userName, userComment, flagged";
        if ($isAdmin) $selectors.=", userEmail";
        $this->db->select($selectors);
        $this->db->where("removed",0);
        $timeStr = "uploadDate ". ($increment < 0 ? ">" : "<");
        if ($lastCommentDate) $this->db->where($timeStr, $lastCommentDate);
        $or_where = "(subjectId = '$commentHome' OR movieNameUrl = '$commentHome')";
        $this->db->where($or_where);

        $this->db->order_by("uploadDate", "desc");
        if ($increment > 0) $this->db->limit($increment);
        $query = $this->db->get('commentsTable');
        $a = array();
        foreach ($query->result() as $row){
            $a[] = $this->format_output_comment($row);
        }
        return $a;
    }



}
?>