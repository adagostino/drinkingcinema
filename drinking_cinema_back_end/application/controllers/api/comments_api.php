<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');
require APPPATH.'/libraries/REST_Controller.php';
class Comments_api extends REST_Controller {
    private $maxFieldLength = 512;
    private $maxCommentLength = 2048;
    private $validFields = array(
        'name',
        'email',
        'comment'
    );


    function __construct() {
        parent::__construct();
        $this->load->model('email_service');
        $this->load->model('comments_service');
        $this->load->model('search_service');
        $this->load->model('error_service');
        $this->load->model('scrubber_service');
        $this->load->library('tank_auth');
    }

    private function is_admin() {
        $isAdmin = $this->tank_auth->is_admin();
        if (!$isAdmin) $this->send(array(), array("E_01"), array());
        return $isAdmin;
    }

    private function send($success, $errors, $input) {
        if (empty($errors)){
            $this->response($success, 200);
        } else {
            $error = $this->error_service->get($errors, $input);
            $this->response($error, $error["code"]);
        }
    }

    private function scrubAndValidateComment($comment){
        $errors = array();
        $c = array();
        foreach ($this->validFields as $key => $value) {
            $obj = $this->validate($value,$comment[$value]);
            $c[$value] = $obj["value"];
            array_merge($errors,$obj["errors"]);
        }
        return array(
            'comment'=> $c,
            'errors' => $errors
        );
    }

    private function validate($key, $value){
        $errors = array();
        switch($key){
            case "name":
                $value = $this->scrubber_service->stripHTML($value);
                if (!$value) $errors[] = "EC_03";
                if (strlen($value) > $this->maxFieldLength) $errors[] = "EC_04";
                break;
            case "email":
                $value = $this->scrubber_service->stripHTML($value);
                if (!$value) $errors[] = "EC_05";
                if (strlen($value) > $this->maxFieldLength) $errors[] = "EC_06";
                if (!$this->scrubber_service->isEmail($value)) $errors[] = "EC_07";
                break;
            case "comment":
                $value = $this->scrubber_service->scrub($value, $this->tank_auth->is_admin());
                if (!$value) $errors[] = "EC_08";
                if (strlen($value) > $this->maxFieldLength) $errors[] = "EC_09";
                break;
        }
        return array(
            'value'=> $value,
            'errors' => $errors
        );
    }

    function comment_put() {
        $commentHome = $this->put('commentHome');
        $commentPath = $this->put('commentPath');
        $comment = $this->put('comment');
        $errors = array();
        $success = array();
        $input = array('commentHome' => $commentHome, 'comment' => $comment);
        if (!$commentHome) $errors[] = "EC_01";
        if (!$comment) $errors[] = "EC_02";
        // first check for required fields
        if (empty($errors)){
            if (!$comment["name"]) $errors[] = "EC_03";
            if (!$comment["email"]) $errors[] = "EC_05";
            if (!$comment["comment"]) $errors[] = "EC_08";
        }
        // now scrub and validate the fields
        if (empty($errors)) {
            $obj = $this->scrubAndValidateComment($comment,$errors);
            $comment = $obj["comment"];
            array_merge($errors,$obj["errors"]);
        }

        // after everything is said and done, add the comment
        if (empty($errors)){
            $comment = $this->comments_service->upload_comment($commentHome, $commentPath, $comment);
            if ($comment) {
                $success = $comment;
            } else {
                $errors[] = "EC_10";
            }
        }
        $this->send($success,$errors,$input);
    }

    function comment_update_post(){
        if (!$this->is_admin()) return;
        $comment = $this->post('comment');
        $errors = array();
        $success = array();
        $input = array('comment' => $comment);
        if (!$comment) $errors[] = "EC_02";
        if (empty($errors)) {
            if (!$comment["p_Id"]) $errors[] = "EC_11";
        }
        // now scurb and validate the fields
        if (empty($errors)) {
            $p_Id = $comment["p_Id"];
            $obj = $this->scrubAndValidateComment($comment,$errors);
            $comment = $obj["comment"];
            $comment["p_Id"] = $p_Id;
            array_merge($errors,$obj["errors"]);
        }
        // after everything is said and done, add the comment
        if (empty($errors)){
            $comment = $this->comments_service->update_comment($comment);
            if ($comment) {
                $success = $comment;
            } else {
                $errors[] = "EC_10";
            }
        }
        $this->send($success,$errors,$input);

    }

    function comment_flag_post(){
        $id = $this->post('id');
        $errors = array();
        $success = array();
        $input = array('id' => $id);
        if (!$id) $errors[] = "EC_11";
        if (empty($errors)){
            $comment = $this->comments_service->flag_comment($id);
            if ($comment) {
                $success = $comment;
            } else {
                $errors[] = "EC_10";
            }
        }
        $this->send($success,$errors,$input);
    }

    function comment_remove_delete(){
        if (!$this->is_admin()) return;
        $id = $this->delete('id');
        $errors = array();
        $success = array();
        $input = array('id' => $id);
        if (!$id) $errors[] = "EC_11";
        if (empty($errors)){
            $comment = $this->comments_service->remove_comment($id);
            if ($comment) {
                $success = $comment;
            } else {
                $errors[] = "EC_10";
            }
        }
        $this->send($success,$errors,$input);
    }

    function comments_get(){
        $commentHome = $this->get('commentHome');
        $lastComment = $this->get('lastComment');
        $increment = $this->get('increment');
        $errors = array();
        $success = array();
        $input = array('commentHome' => $commentHome, 'lastComment'=>$lastComment, 'increment'=>$increment);
        if (!$commentHome) $errors[] = "EC_01";
        if (!$increment) $errors[] = "EC_12";
        if ($increment && !intval($increment)) $errors[] = "EC_12";
        if (empty($errors)){
            $comments = $this->search_service->search_comments($commentHome,$lastComment,$increment);
            if (is_array($comments)){ // use is_array b/c [] is falsey
                $success = $comments;
            } else {
                $errors[] = "EC_10";
            }
        }
        $this->send($success,$errors,$input);
    }

    function send_comment_email_post(){
        $this->email_service->send_emails();
    }

    function test_get(){


    }
}

?>