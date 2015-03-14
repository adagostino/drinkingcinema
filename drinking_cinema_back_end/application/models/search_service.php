<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');
class search_service extends CI_Model {
    private $_maxSearchResults = 100;

    private $_movieTableSearchOptions = array(
        "table" => "movieTable",
        "searchFields" => array(
            "movieName" => 20,
            "tags" => 10,
            "rulesHTML" => 1,
            "optionalRulesHTML" => 1
        ),
        "idField" => "p_Id",
        "timeField" => "uploadDate", // used for time_search
        "titleField" => "movieName" // used for alpha_search
    );

    private $_commentsTableSearchOptions = array(
        "table" => "commentsTable",
        "timeField" => "uploadDate",
        "idField" => "p_Id",
        "titleField" => array("subjectId","movieNameUrl")
    );

    function __construct() {
        // Call the Model constructor
        parent::__construct();
        $this->load->model('game_service');
        $this->load->model('comments_service');
        $this->load->database();
    }

    function search_movies($searchTerms,$offset = 0,$limit = 0) {
        $queryResult = $this->search($searchTerms,"movieTable",$offset,$limit);

        // do post-processing here
        $results = array();
        $names = array();
        foreach ($queryResult["results"] as $row) {
            $game = $this->game_service->post_process_game($row);
            $names[] = $game["nameUrl"];
            $results[] = $game;
        }
        // get the comments. This assumes that getting them all at once is faster than multiple queries
        $comments = $this->comments_service->get_num_comments($names);
        $ct = 0;
        foreach ($results as $result){
            $numComments = $comments[$result["nameUrl"]];
            $results[$ct]["numComments"] = $numComments ? $numComments : 0;
            $ct++;
        }
        return array(
            'numResults'=> $queryResult["numResults"],
            'results' => $results
        );
    }

    function get_table_options($tableName) {
        $so = "_".$tableName."SearchOptions";
        return $this->$so;
    }

    function search_comments($searchTerms, $offsetId = null, $limit = 0){
        $searchOpts = $this->get_table_options("commentsTable");
        $searchOpts["offsetId"] = $offsetId ? $this->db->escape($offsetId) : null;
        $limit = intval($limit);
        if ($limit > $this->_maxSearchResults) $limit = $this->_maxSearchResults;
        $searchOpts["direction"] = $limit < 0 ? -1 : 1;
        if ($limit > 0) $searchOpts["limit"] = $limit;
        $searchOpts["searchTerms"] = str_replace(" ", "+", $this->clean_search_terms($searchTerms));
        $searchOpts["order"] = "DESC";
        $sql = $this->id_search_sql($searchOpts);

        $query = $this->db->query($sql);
        $results = array();
        $queryResults = $query->result();
        $comments = array();
        foreach ($queryResults as $row){
            $comments[] = $this->comments_service->post_process_comment($row);
        }
        $results['numResults'] = $queryResults ? intval($queryResults[0]->numResults) : 0;
        $results['results'] = $comments;
        return $results;
    }

    function search($searchTerms, $tableName, $offset = 0, $limit = 0){
        $results = null;
        if ($sql = $this->get_search_sql($searchTerms, $tableName, $offset, $limit)){
            $query = $this->db->query($sql);
            $results = array(
                'numResults' => 0,
                'results' => $query->result()
            );
            if ($results["results"]){
                $results['numResults'] = intval($results["results"][0]->numResults);
            }
        }
        return $results;
    }

    function get_search_sql($searchTerms, $tableName, $offset = 0, $limit = 0){
        $searchTerms = $this->clean_search_terms($searchTerms);
        $searchOpts = $this->get_table_options($tableName);
        $sql = "";
        $type = "";
        if ($searchTerms && $searchOpts){
            $searchOpts["searchTerms"] = $searchTerms;
            $limit = intval($limit);
            if ($limit > $this->_maxSearchResults) $limit = $this->_maxSearchResults;
            switch ($searchTerms) {
                case "newest":
                    $type = "time";
                    $searchOpts["order"] = "DESC";
                    break;
                case "oldest":
                    $type = "time";
                    $searchOpts["order"] = "ASC";
                    break;
                case "a-z":
                    $type = "alpha";
                    $searchOpts["order"] = "ASC";
                    break;
                case "z-a":
                    $type = "alpha";
                    $searchOpts["order"] = "DESC";
                    break;
                case "id":
                    $type = "id";
                    $searchOpts["order"] = "DESC";
                    break;
                default:
                    $type = "weighted";
                    break;
            }
            $fn = $type."_search_sql";
            $searchOpts["limit"] = $limit;
            $searchOpts["offset"] = $offset;
            $sql = $this->$fn($searchOpts);
        }
        return $sql;
    }

    function clean_search_terms($searchTerms) {
        return $searchTerms ? trim(urldecode(strtolower($searchTerms))) : "";
    }

    function select_sql_start($opts){
        // maybe pass opts into it sometime to customize
        return "SELECT *, Results.numResults from (SELECT *";
    }

    function select_sql_end($opts){
        $offset = isset($opts["offset"]) ? $opts["offset"] : "0";
        $limit = isset($opts["limit"]) && $opts["limit"] ? $opts["limit"] : "";
        $sql = $limit ? " limit ".$offset.",".$limit : "";
        $sql.=") res ";
        return $sql;
    }

    function count_sql($opts, $search = "", $where = ""){
        $sql = " LEFT JOIN (SELECT COUNT(*) AS numResults,  0 AS Bonus";
        if ($search){
            $sql.=", ";
            $sql.=$search;
        }
        $sql.= " FROM ".$opts["table"];
        $sql.= $where;
        $sql.=") Results ON 0 = Results.Bonus ";
        return $sql;
    }

    function time_search_sql($opts){
        $sql = $this->select_sql_start($opts)." FROM ".$opts["table"];
        $sql.=" ORDER BY ".$opts["timeField"]." ".$opts["order"];
        $sql.=$this->select_sql_end($opts);
        $sql.=$this->count_sql($opts);

        return $sql;
    }

    function alpha_search_sql($opts){
        $titleField = $opts["titleField"];
        $titleField = is_array($titleField) ? $titleField[0] : $titleField;
        $table = $opts["table"];
        $sql = $this->select_sql_start($opts).", ";
        $sql.= "CASE WHEN SUBSTRING_INDEX(".$titleField.", ' ', 1)
                    IN ('a', 'an', 'the')
                THEN CONCAT(
                    SUBSTRING(".$titleField.", INSTR(".$titleField.", ' ') + 1),', ',
                    SUBSTRING_INDEX(".$titleField.", ' ', 1)
                )
                ELSE ".$titleField."
                END AS TitleSort
                FROM ".$table;
        $sql.= " ORDER BY TitleSort ";
        $sql.= $opts["order"];
        $sql.= $this->select_sql_end($opts);
        $sql.= $this->count_sql($opts);
        return $sql;
    }

    function weighted_search_sql($opts){
        // $opts = {
        //              table: tableName,
        //              searchFields: object of {field : weight}, Note: All weighted fields must be indexed in sql as "FULLTEXT INDEX"
        //              order: ASC or DESC
        //          }
        $searchTerms = $this->db->escape($opts["searchTerms"]);
        $sql = $this->select_sql_start($opts).", ";
        $fields = "";
        $orderBy = "ORDER BY ";
        $ct = 1;

        $search = "";
        foreach ($opts["searchFields"] as $field => $weight) {
            if ($fields) $fields.=",";
            $fields.= $field;
            if ($ct > 1) $search.=", ";
            $search.= "MATCH (".$field.") AGAINST (" . $searchTerms . ") AS rel".$ct;
            if ($ct > 1) $orderBy.="+";
            $orderBy.="(rel".$ct."*".($weight ? $weight : 1).")";
            $ct++;
        }
        $sql.=$search;
        $sql.=" FROM ".$opts["table"];

        $where=" WHERE MATCH(";
        $where.=$fields;
        $where.=") AGAINST (" . $searchTerms . ") ";
        $sql.=$where;
        $sql.=$orderBy." ";
        $sql.= isset($opts["order"]) ? $opts["order"] : "DESC";
        $sql.=$this->select_sql_end($opts);
        $sql.=$this->count_sql($opts, $search, $where);

        return $sql;
    }

    function id_search_sql($opts){
        $idField = $opts["idField"];
        $titleFields = is_array($opts["titleField"]) ? $opts["titleField"] : array($opts["titleField"]);
        $searchTerms = $this->db->escape($opts["searchTerms"]);
        $sql = $this->select_sql_start($opts);
        $sql.=" FROM ".$opts["table"];
        $where=" WHERE ";
        $where.="(";
        $ct = 0;
        foreach ($titleFields as $num => $field){
            if ($ct > 0) $where.=" OR ";
            $where.= $field."=".$searchTerms;
            $ct++;
        }
        $where.=") AND removed=0 ";
        $sql.=$where;
        if ($opts["offsetId"]) $sql.="AND ".$idField.($opts["direction"] < 0 ? " > " : " < ").$opts["offsetId"]." ";
        $sql.="ORDER BY ".$opts["timeField"]." ";
        $sql.=isset($opts["order"]) ? $opts["order"] : "DESC";
        $sql.=$this->select_sql_end($opts);
        $sql.=$this->count_sql($opts,null,$where);

        return $sql;
    }

}

?>