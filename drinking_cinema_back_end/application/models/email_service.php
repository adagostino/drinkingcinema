<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');
class email_service extends CI_Model {
    private $_emailFrom = "support@drinkingcinema.com";
    private $_website = "DrinkingCinema.com";
    private $_typeMap = array(
        "comment" => "send_comment_email",
    );
    private $_reverseTypeMap = array();

    function __construct() {
        // Call the Model constructor
        parent::__construct();
        $this->load->model('scrubber_service');
        $this->load->database();
        foreach ($this->_typeMap as $key => $value){
            $this->_reverseTypeMap[$value] = $key;
        }
    }

    function add_email($email){
        $email["email_from"] = $this->_emailFrom;
        $data = array();
        $sql = "INSERT INTO emailsTable (";
        $keys = "";
        $values = "";
        foreach ($email as $key => $value){
            $data[$key] = $value;
            $keys.= $keys ? "," : "";
            $values.= $values ? ",": "";
            $keys.=$key;
            $values.= $this->db->escape($value);
        }
        $data["email_added_date"] = "UTC_TIMESTAMP";
        $keys.= ",email_added_date";
        $values.=",UTC_TIMESTAMP";
        $sql.=$keys.") VALUES (".$values.")";
        $query = $this->db->query($sql);
        $id = $this->db->insert_id();
        return $id;
    }

    function send_emails(){
        $query = $this->db->get_where('emailsTable', array('email_sent' => 0));
        foreach ($query->result_array() as $row){
            $this->send_email($row);
        }
    }

    function send_email($email){
        $fn = $this->_typeMap[$email["email_type"]];
        if (!$fn) return;
        $this->$fn($email);
        // remember to mark the email as read
        $this->update_email($email);
    }

    function update_email($email){
        $sql = "UPDATE emailsTable SET ";
        $kvps = "email_sent=1, email_sent_date=UTC_TIMESTAMP()";
        $where = " WHERE p_Id=".$this->db->escape($email["p_Id"]);
        $sql.=$kvps.$where;
        $query = $this->db->query($sql);
        return $email;
    }

    function get_comment_by_id($p_Id) {
        $query = $this->db->get_where('commentsTable', array('p_Id' => $p_Id), 1);
        $comment = array();
        $c = $query->result()[0];
        foreach ($c as $key=>$value){
           $comment[$key] = htmlspecialchars_decode($value, ENT_QUOTES);
        }
        $comment["commentHome"] = str_replace("+"," ", urldecode($comment["subjectId"]));
        $comment["comment"] = $this->scrubber_service->stripHTML($comment["userComment"]);
        $comment["relativeUrl"] = ($comment["path"] ? $comment["path"]."/": "").$comment["subjectId"];
        return $comment;
    }

    function get_comment_email($email){
        if (!$email["comment"]) $email["comment"] = $this->get_comment_by_id($email["email_body"]);
        return $this->twiggy->set('email',$email)->template('email/new-comment-email')->render();
    }

    function send_comment_email($email){
        $email["comment"] = $this->get_comment_by_id($email["email_body"]);
        $comment_email = $this->get_comment_email($email);

        $this->load->library('email');
        $this->email->from($email["email_from"], $this->_website);
        $this->email->reply_to($this->_emailFrom, $this->_website);
        $this->email->to($email["email_to"]);
        $this->email->subject("New Comment Under ".$email["comment"]["commentHome"]);
        $this->email->message($comment_email);
        $this->email->send();
    }

    /*
    function sendCommentEmail($p_Id){
        $comment_a = $this->getComment($p_Id);
        $email = "CommentPolice@drinkingcinema.com";
        $type = "commentSubmitted";
        if ($comment_a != "no results"){
            $data = array();
            foreach ($comment_a as $json_a){
                foreach ($json_a as $json_o) {
                    //echo $json_o->name.','.$json_o->value;
                    $data[$json_o->name]= $json_o->value;
                }
            }
            if ($data["notified"]==0){
                $sql = "UPDATE commentsTable SET notified=1 WHERE p_Id=".$this->ci->db->escape($p_Id);
                $query = $this->ci->db->query($sql);
            }else{
                return;
            }
            $this->ci->load->library('email');
            $this->ci->email->from($this->ci->config->item('webmaster_email', 'tank_auth'), $this->ci->config->item('website_name', 'tank_auth'));
            $this->ci->email->reply_to($this->ci->config->item('webmaster_email', 'tank_auth'), $this->ci->config->item('website_name', 'tank_auth'));
            $this->ci->email->to($email);
            $subj = "New Comment Under ".$data["movieName"];
            $this->ci->email->subject($subj);
            //$this->email->subject(sprintf($this->lang->line('auth_subject_'.$type), $this->config->item('website_name', 'tank_auth')));
            $this->ci->email->message($this->ci->load->view('email/'.$type.'-html', $data, TRUE));
            $this->ci->email->set_alt_message($this->ci->load->view('email/'.$type.'-txt', $data, TRUE));
            echo $this->ci->email->send();
        }
    }
    */
}

?>