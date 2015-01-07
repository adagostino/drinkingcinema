<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');
    class image_service extends CI_Model {

        private $imageSizes = array(
            "embed" => array(
                "width" => 387,
                "height" => 500
            ),
            "small" => array(
                "width" => 618,
                "height" => 800
            ),
            "large" => array(
                "width" => 750,
                "height" => 970
            )
         );

        function __construct() {
            // Call the Model constructor
            parent::__construct();
        }

        function upload_game($fileName, $name){
            $info = pathinfo($fileName);
            $ext = $info['extension'];
            if (!$name) {
                $name = $info['filename'];
            }
            // override the extension for now
            $ext = 'jpg';
            $folder = $this->globals->get_games_dir();
            $uploadPath = $folder.$name.".".$ext;

            $input = fopen("php://input", "r");
            $temp = tmpfile();
            $realSize = stream_copy_to_stream($input, $temp);


            $target = fopen($uploadPath, "w");
            fseek($temp, 0, SEEK_SET);
            stream_copy_to_stream($temp, $target);
            fclose($target);

            //file_put_contents($uploadPath, file_get_contents('php://input'));

            $images = array(
                "original" => str_replace("../","http://",$uploadPath),
                "ext" => $ext,
                "name" => $name
            );

            foreach ($this->imageSizes as $size => $dim) {
                $resizePath = $folder.$name."_".$size.".".$ext;
                $this->resize($dim["width"], $dim["height"], $uploadPath, $resizePath);
                $images[$size] = str_replace("../","http://",$resizePath);
            }
            return $images;
        }

        function resize($width,$height,$srcImg,$newName,$quality = "50%") {
            $config['image_library'] = 'gd2';
            $config['source_image']	= $srcImg;
            $config['maintain_ratio'] = TRUE;
            $config['quality'] = $quality;
            $config['width'] = $width;
            $config['height'] = $height;
            $config['new_image'] = $newName;
            $this->load->library('image_lib');
            $this->image_lib->initialize($config);
            $this->image_lib->resize();
        }

        function create_game_thumbnail($name, $coords, $size, $postfix) {
            $targ_w = $targ_h = $size;
            $jpeg_quality = 90;
            		// 618,800
            		// 2550,3300
            $ratioy = 3300/intval($coords["oh"]);
            $ratiox = 2550/intval($coords["ow"]);

            $x = intval($coords["x"])*$ratiox;
            $y = intval($coords["y"])*$ratioy;
            $w = intval($coords["w"])*$ratiox;
            $h = intval($coords["h"])*$ratioy;

            $folder = $this->globals->get_games_dir();

            $src = $folder.$name.".jpg";
            $output_filename =  $folder.$name.$postfix.".jpg";
            $img_r = imagecreatefromjpeg($src);
            $dst_r = imagecreatetruecolor( $targ_w, $targ_h );

            imagecopyresampled($dst_r,$img_r,0,0,$x,$y,$targ_w,$targ_h,$w,$h);
            imagejpeg($dst_r, $output_filename, $jpeg_quality);
            return str_replace("../","http://",$output_filename);

        }

        function upload_images_from_html($html){
            // find anchors with images as their href and uploads them if they're not already uploaded
            $dom = new DOMDocument();
            $dom->loadHTML($html);
            $anchors = $dom->getElementsByTagName("a");
            foreach ($anchors as $anchor) {
                $href = $anchor->getAttribute("href");
                if ($href) {

                }
            }
        }

        function is_image($url){
    		$pu = parse_url($url);
    		$uHost = strtolower($pu["host"]);
    		$bu = parse_url(base_url());
    		$bHost =  strtolower($bu["host"]);
    		$data=array();
    		if ($uHost == $bHost || ($uHost=="127.0.0.1" && $bHost=="localhost")){
    			$pup = $pu["path"];
    			$pupa = explode("/",$pup);
    			$first = "";
    			$ct = 0;
    			while ($first=="" && $ct<count($pupa)){
    				$first = trim($pupa[$ct]);
    				$ct++;
    			}
    			if ($first=="uli"){
    				$last = "";
    				while ($last==""){
    					$last = trim(array_pop($pupa));
    				}
    				$fImg = explode(".",$last);
    				$ext = $fImg[1];
    				$data["isImage"]=true;
    				$data["ext"]=$ext;
    				return $data;
    			}
    		}
    		$ch = curl_init();
    		curl_setopt ($ch, CURLOPT_RETURNTRANSFER, 1);
    		curl_setopt ($ch, CURLOPT_URL, $url);
    		curl_setopt ($ch, CURLOPT_CONNECTTIMEOUT, 20);
    		curl_setopt ($ch, CURLOPT_USERAGENT, $_SERVER['HTTP_USER_AGENT']);
    		curl_setopt ($ch, CURLOPT_FOLLOWLOCATION, true);
    		curl_setopt($ch, CURLOPT_HEADER, true);
    		curl_setopt($ch, CURLOPT_NOBODY, true);
    		curl_setopt($ch, CURLOPT_CUSTOMREQUEST,"HEAD");

    		$content = curl_exec ($ch);
    		$contentType = curl_getinfo($ch, CURLINFO_CONTENT_TYPE);
    		if (substr($contentType, 0, 5) == "image") // strlen("Content-Type: image") == 19
            {
            	$c = explode("/",$contentType);
    			$data["isImage"]=true;
    			$data["ext"]=end($c);
            }else{
            	$data["isImage"]=false;
            }
    		return $data;
    	}

        function getImage($url,$ext,$uploadDirectory="uli/"){
    		$pu = parse_url($url);
    		$uHost = strtolower($pu["host"]);
    		$bu = parse_url(base_url());
    		$bHost =  strtolower($bu["host"]);
    		$pup = $pu["path"];
    		$pupa = explode("/",$pup);
    		if ($uHost == $bHost){
    			//return $url;
    			$first = "";
    			$ct = 0;
    			while ($first=="" && $ct<count($pupa)){
    				$first = trim($pupa[$ct]);
    				$ct++;
    			}
    			if ($first=="uli"){
    				return $url;
    			}else{
    				return json_encode($pupa);
    			}
    		}
    		$last = "";
    		while ($last==""){
    			$last = trim(array_pop($pupa));
    		}
    		$fImg = explode(".",$last);
    		$fName = $fImg[0];
    		$ulFileName = $this->getFileName($fName,$ext,$uploadDirectory);
    		/*
    		$uploadUrl = site_url(array("db_admin","gifURL_dcParty"));
    		$this->curl_get_async($uploadUrl,array(
    			"url"=>$url,
    			"fileName"=>$ulFileName,
    			"path"=>$uploadDirectory
    		));
    		*/
    		$this->uploadImage($url,$ulFileName,$uploadDirectory);
    		//{"scheme":"http","host":"localhost","port":81,"path":"\/"}
    		$rurl = "";
    		if ($bHost=="localhost"){
    			$port = $bu["port"];
    			$scheme = $bu["scheme"];
    			$rurl = $scheme."://127.0.0.1".":".$port."/uli/".$ulFileName;
    		}else{
    			$rurl = site_url(array("uli",$ulFileName));
    		}

    		return $rurl;

    	}


    }

?>