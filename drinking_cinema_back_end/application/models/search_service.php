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
            $results = array(
                'numResults' => 0,
                'results' => $query->result()
            );
            if ($results["results"][0]){
                $results['numResults'] = intval($results["results"][0]->numResults);
            }
        }
        return $results;
    }

    function clean_search_terms($searchTerms) {
        return $searchTerms ? trim(urldecode(strtolower($searchTerms))) : "";
    }

    function select_sql($opts){
        // maybe pass opts into it sometime to customize
        return "SELECT *, Results.numResults";
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
        $sql = $this->select_sql($opts)." FROM ".$opts["table"];
        $sql.=$this->count_sql($opts);
        $sql.=" ORDER BY ".$opts["timeField"]." ".$opts["order"];
        return $sql;
    }

    function alpha_search_sql($opts){
        $titleField = $opts["titleField"];
        $table = $opts["table"];
        $sql = $this->select_sql($opts).", ";
        $sql.= "CASE WHEN SUBSTRING_INDEX(".$titleField.", ' ', 1)
                    IN ('a', 'an', 'the')
                THEN CONCAT(
                    SUBSTRING(".$titleField.", INSTR(".$titleField.", ' ') + 1),', ',
                    SUBSTRING_INDEX(".$titleField.", ' ', 1)
                )
                ELSE ".$titleField."
                END AS TitleSort
                FROM ".$table;
        $sql.= $this->count_sql($opts);
        $sql.= "ORDER BY TitleSort ";
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
        $sql = $this->select_sql($opts).", ";
        $fields = "";
        $orderBy = "ORDER BY ";
        $ct = 1;

        $search = "";
        foreach ($opts["searchFields"] as $field => $weight) {
            if ($fields) $fields.=",";
            $fields.= $field;
            if ($ct > 1) $search.=", ";
            $search.= "MATCH (".$field.") AGAINST (" . $this->db->escape($searchTerms) . ") AS rel".$ct;
            if ($ct > 1) $orderBy.="+";
            $orderBy.="(rel".$ct."*".($weight ? $weight : 1).")";
            $ct++;
        }
        $sql.=$search;
        $sql.=" FROM ".$opts["table"];

        $where=" WHERE MATCH(";
        $where.=$fields;
        $where.=") AGAINST (" . $this->db->escape($searchTerms) . ") ";

        $sql.=$this->count_sql($opts, $search, $where);

        $sql.=$where;

        $sql.=$orderBy." ";
        $sql.= isset($opts["order"]) ? $opts["order"] : "DESC";

        return $sql;
    }

}

?>