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
        "timeField" => "uploadDate", // used for time_search
        "titleField" => "movieName" // used for alpha_search
    );


    function __construct() {
        // Call the Model constructor
        parent::__construct();
        $this->load->model('game_service');
        $this->load->model('comments_service');
        $this->load->database();
    }

    function search_movies($searchTerms,$offset = 0,$limit = 0) {
        $queryResult = $this->search($searchTerms,$this->_movieTableSearchOptions,$offset,$limit);
        // do post-processing here
        $results = array();
        $names = array();
        foreach ($queryResult as $row) {
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

        return $results;
    }

    function search($searchTerms, $opts, $offset = 0, $limit = 0){
        $searchTerms = $this->clean_search_terms($searchTerms);
        $results = null;
        $type = "";
        if ($searchTerms){
            $searchOpts = $opts;
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
                default:
                    $type = "weighted";
                    break;
            }
            $fn = $type."_search_sql";
            $sql = $this->$fn($searchOpts);
            if ($limit) {
                $sql.=" LIMIT ".$limit;
                $sql.=" OFFSET ".$offset;
            }

            $query = $this->db->query($sql);
            $results = $query->result();
        }
        return $results;
    }

    function clean_search_terms($searchTerms) {
        return $searchTerms ? trim(urldecode(strtolower($searchTerms))) : "";
    }

    function time_search_sql($opts){
        $sql = "SELECT * FROM ".$opts["table"]." ORDER BY ".$opts["timeField"]." ".$opts["order"];
        return $sql;
    }

    function alpha_search_sql($opts){
        $titleField = $opts["titleField"];
        $table = $opts["table"];
        $sql = "SELECT *,
		        CASE WHEN SUBSTRING_INDEX(".$titleField.", ' ', 1)
                    IN ('a', 'an', 'the')
                THEN CONCAT(
                    SUBSTRING(".$titleField.", INSTR(".$titleField.", ' ') + 1),', ',
                    SUBSTRING_INDEX(".$titleField.", ' ', 1)
                )
                ELSE ".$titleField."
                END AS TitleSort
                FROM ".$table."
                ORDER BY TitleSort ";
        $sql.= $opts["order"];
        return $sql;
    }

    function weighted_search_sql($opts){
        // $opts = {
        //              table: tableName,
        //              searchFields: object of {field : weight}, Note: All weighted fields must be indexed in sql as "FULLTEXT INDEX"
        //              order: ASC or DESC
        //          }
        $searchTerms = $opts["searchTerms"];
        $sql = "SELECT *, ";
        $fields = "";
        $orderBy = "ORDER BY ";
        $ct = 1;
        foreach ($opts["searchFields"] as $field => $weight) {
            if ($fields) $fields.=",";
            $fields.= $field;
            if ($ct > 1) $sql.=", ";
            $sql.= "MATCH (".$field.") AGAINST (" . $this->db->escape($searchTerms) . ") AS rel".$ct;
            if ($ct > 1) $orderBy.="+";
            $orderBy.="(rel".$ct."*".($weight ? $weight : 1).")";
            $ct++;
        }
        $sql.=" FROM ".$opts["table"]." WHERE MATCH(";
        $sql.=$fields;
        $sql.=") AGAINST (" . $this->db->escape($searchTerms) . ") ";
        $sql.=$orderBy." ";
        $sql.= isset($opts["order"]) ? $opts["order"] : "DESC";

        return $sql;
    }

}

?>