<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');
    class social_media_service extends CI_Model {
        private $_defaultLongDescription = "Drinking Cinema is a continually updated database of movie drinking games, striving to enhance cinema through the majesty of alcohol.";
        private $_defaultShortDescription = "Movie Drinking Games That Hammer Ass.";
        private $_defaultShortDescription2 = "Drinking Cinema: Enhancing Cinema Through the Majesty of Alcohol.";
        private $_defaultKeywords = "drinking,games,movies,cinema,partying,movie,movie drinking games";
        private $_defaultPin = "dc_pin.jpg";
        private $_defaultThumb = "DC_sn_thumbnail.png";

        function __construct()
        {
            // Call the Model constructor
            parent::__construct();
        }

        function get_site(){
            $protocol = strpos(strtolower($_SERVER['SERVER_PROTOCOL']),'https') === FALSE ? 'http' : 'https';
            $host = $_SERVER['HTTP_HOST'];
            return $protocol."://".$host;
        }

        function get($dir = "", $game = null) {
            $vars = $this->get_vars($dir,$game);
            return array(
                'ogUrl'=> $vars["ogUrl"],
                'pinUrl' => $vars["pinUrl"],
                'tweet' => $vars["tweet"],
                'thumb' => $vars["thumb"],
                'metaTags' => $this->get_meta_tags($dir,$game,$vars)
            );
        }

        function get_meta_tags($dir = "", $game = null, $vars = null){
            if (!$vars) {
                $vars = $this->get_vars($dir, $game);
            }
            $title = $game ? $vars["gameDescription"] : $this->_defaultShortDescription;
            $a = array();
            $a[] = $this->build_tag("keywords", $this->_defaultKeywords.(",".$game["name"].",".$game["tags"] ?  : ""));
            $a[] = $this->build_tag("description",$vars["fullDescription"]);
            $a[] = $this->build_tag("apple-mobile-web-app-capable", "yes");
            // fb meta tags
            $a[] = $this->build_tag("og:type","website","property");
            $a[] = $this->build_tag("og:site_name", "Drinking Cinema", "property");
            $a[] = $this->build_tag("og:image",$vars["thumb"],"property");
            $a[] = $this->build_tag("og:description", $this->_defaultShortDescription2, "property");
            $a[] = $this->build_tag("og:title", $title,"property");
            $a[] = $this->build_tag("og:url",$vars["ogUrl"],"property");
            $a[] = $this->build_tag("fb:admins", "21410601","property");
            $a[] = $this->build_tag("fb:app_id", "230855340382169");
            // google maybe?
            $a[] = $this->build_tag("image",$vars["thumb"],"itemprop");
            $a[] = $this->build_tag("description", $this->_defaultShortDescription2 ,"itemprop");
            $a[] = $this->build_tag("name", $title, "itemprop");
            // twitter
            if ($game){
                $a[] = $this->build_tag("twitter:card", "photo");
                $a[] = $this->build_tag("twitter:site", "@drinkingcinema");
                $a[] = $this->build_tag("twitter:creator", "@drinkingcinema");
                $a[] = $this->build_tag("twitter:title", $vars["shortGameDescription"]);
                $a[] = $this->build_tag("twitter:image", $vars["iurl"]);
                $a[] = $this->build_tag("twitter:image:width", "560");
                $a[] = $this->build_tag("twitter:image:height", "725");
                $a[] = $this->build_tag("twitter:domain", $vars["ogUrl"]);
            }
            return $a;
        }

        function build_tag($name, $content, $nameKey = "name"){
            $a = array();
            $a[$nameKey] = $name;
            $a["content"] = $content;
            return $a;
        }

        function get_vars($dir = "", $game = null){
            $site = $this->get_site();
            $gamesDir = $this->globals->get_games_dir();
            $imagesDir = $this->globals->get_images_dir();

            $cdn = $game ? $gamesDir : $imagesDir;
            $shortGameDescription = $game ? "A drinking game for ".$game["name"] : "";
            $gameDescription = $shortGameDescription ? $shortGameDescription.", you say? Time to party. " : "";
            $description = $gameDescription.$this->_defaultLongDescription;
            $dir = $game ? "game" : $dir;
            $site.= $dir ? "/" : "";

            // get the images
            $iurl = $cdn.($game ? $game["nameUrl"]."_small.jpg" : $this->_defaultPin);
            $thumb = $cdn.($game ? $game["nameUrl"]."_sn_thumb.jpg" : $this->_defaultThumb);

            if (!file_exists($thumb)){
                $thumb = $imagesDir.$this->_defaultThumb;
            }
            if (!file_exists($iurl)){
                $iurl = $imagesDir.$this->_defaultPin;
            }
            $thumb = str_replace("../","http://",$thumb);
            $iurl = str_replace("../","http://", $iurl);

            $ogUrl = $site.$dir.($game ? "/".$game["nameUrl"] : "");
            $pinUrl = "http://pinterest.com/pin/create/button/?url=".rawurlencode($ogUrl)."&media=".rawurlencode($iurl)."&description=".rawurlencode($description);
            $tweet = $game ? $gameDescription : $this->_defaultShortDescription;
            return array(
                'ogUrl' => $ogUrl,
                'pinUrl'=> $pinUrl,
                'tweet'=> $tweet,
                'thumb' => $thumb,
                'iurl' => $iurl,
                'fullDescription' => $description,
                'gameDescription' => $gameDescription,
                'shortGameDescription' => $shortGameDescription
            );

        }


    }
?>
