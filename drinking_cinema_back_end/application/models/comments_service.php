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
        //$this->ci =& get_instance();
        $this->load->model('scrubber_service');
        $this->load->model('email_service');
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
        return $comment;
    }

    function upload_comment($commentHome, $commentPath, $comment){
        $commentHome = $this->format_comment_home($commentHome);
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
        $keys.= ",uploadDate, subjectId, path";
        $values.=",UTC_TIMESTAMP,".$this->db->escape($commentHome).",".$this->db->escape(strtolower($commentPath));
        $sql.=$keys.") VALUES (".$values.")";
        $query = $this->db->query($sql);
        $id = $this->db->insert_id();
        $this->add_comment_email_to_emailsTable($id);
        return $comment;
    }

    function update_comment($comment) {
        $sql = "UPDATE commentsTable SET ";
        $kvps = "";
        $where = " WHERE p_Id=".$this->db->escape($comment["p_Id"]);
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
        $sql = "UPDATE commentsTable SET ";
        $kvps = "removed=1, removeDate=UTC_TIMESTAMP(), removeUser=".$this->db->escape("admin");
        $where = " WHERE p_Id=".$this->db->escape($commentId);
        $sql.=$kvps.$where;
        $query = $this->db->query($sql);
        return $commentId;
    }

    function format_output_comment($c){
        $comment = array();
        foreach ($c as $key=>$value){
            $newKey = isset($this->_reverseKeyMap[$key]) ? $this->_reverseKeyMap[$key] : $key;
            $comment[$newKey] = htmlspecialchars_decode($value, ENT_QUOTES);
        }
        return $comment;
    }

    function get_comments($commentHome, $increment, $lastComment = null, $isAdmin = true){
        $commentHome = $this->format_comment_home($commentHome);
        $selectors = "p_Id, uploadDate, userName, userComment, flagged";
        if ($isAdmin) $selectors.=", userEmail";
        $this->db->select($selectors);
        $this->db->where("removed",0);
        $timeStr = "p_Id ". ($increment < 0 ? ">" : "<");
        if ($lastComment) $this->db->where($timeStr, $lastComment);
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

    function get_comment_by_id($p_Id) {
        $query = $this->db->get_where('commentsTable', array('p_Id' => $p_Id), 1);
        return $query->result()[0];
    }

    function add_comment_email_to_emailsTable($p_Id){
        $email = array(
            "email_type" => "comment",
            "email_to" => "CommentPolice@drinkingcinema.com",
            "email_body"=> $p_Id
        );
        $this->email_service->add_email($email);
    }
}
?>