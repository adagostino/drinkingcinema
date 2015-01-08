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
            $this->uploadDirectory = $this->globals->get_upload_dir();
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

        function curl_image($url,$fname,$path){
    		$ch = curl_init($url);
    		$output_filename = $path.$fname;
    		$fp = fopen($output_filename, 'wb');
    		curl_setopt($ch, CURLOPT_FILE, $fp);
    		curl_setopt($ch, CURLOPT_HEADER, 0);
    		curl_exec($ch);
    		curl_close($ch);
    		fclose($fp);
    		return str_replace("../","http://",$output_filename);
    	}

        function upload_images_from_html($html){
            // find anchors with images as their href and uploads them if they're not already uploaded
            $dom = new DOMDocument();
            $dom->loadHTML($html);
            $anchors = $dom->getElementsByTagName("a");
            foreach ($anchors as $anchor) {
                $href = $anchor->getAttribute("href");
                if ($ext = $this->is_image($href)) {
                    $newHref = $this->getImage($href, $ext);
                    $anchor->setAttribute("href", $newHref);
                }
            }
            return $dom->saveHTML();
        }

        function get_file_info_from_url($url){
            $purl = parse_url($url);
            $pup = $purl["path"];
            $pupa = explode("/",$pup);
            $last = "";
            while ($last === "") {
                $last = trim(array_pop($pupa));
            }
            $fImg = explode(".",$last);
            return array(
                "full" => $last,
                "name" => $fImg[0],
                "on_cdn" => $this->on_cdn($url),
                "ext" => $fImg[1]
            );
        }

        function on_cdn($url){
            $uli = str_replace("../","http://",$this->globals->get_upload_dir());
            return strrpos($url, $uli) !== false;
        }

        function is_image($url){
            if (!$url) return false;
            if ($this->on_cdn($url)){
                // no need to curl it
                return true;
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
    		$data = false;
    		if (substr($contentType, 0, 5) == "image") // strlen("Content-Type: image") == 19
            {
            	$data = end(explode("/",$contentType));
            }
    		return $data;
    	}

        function getImage($url, $ext, $uploadDirectory = null){
            if (!$uploadDirectory){
                $uploadDirectory = $this->uploadDirectory;
            }
            $finfo = $this->get_file_info_from_url($url);
            if ($finfo["on_cdn"]) return $url;

    		$ulFileName = $this->getFileName($finfo["name"],$ext,$uploadDirectory);
    		return $this->curl_image($url,$ulFileName, $uploadDirectory);
    	}

        function getFileName($fname,$ext,$uploadDirectory = null){
            if (!$uploadDirectory){
                $uploadDirectory = $this->uploadDirectory;
            }
    		$tfilename = $fname;
            $filename = $this->alphaID($this->countFiles($uploadDirectory),false,3,'party'.$tfilename);
            while (file_exists($uploadDirectory . $filename . '.' . $ext)) {
            	$tfilename .= rand(10, 99);
                $filename = $this->alphaID($this->countFiles($uploadDirectory),false,3,'party'.$tfilename);
            }
    		return $filename.'.'.$ext;
    	}

        function countFiles($dir,$type="*"){
    		if (glob($dir."*.".$type) != false)
    		{
    			$filecount = count(glob($dir."*.".$type));
    			return $filecount;
    		}
    		else
    		{
    			return 0;
    		}
    	}

        function alphaID($in, $to_num = false, $pad_up = false, $passKey = null){
    	    //http://kevin.vanzonneveld.net/techblog/article/create_short_ids_with_php_like_youtube_or_tinyurl/
    	    //Running:
    		//alphaID(9007199254740989);
    		//will return 'PpQXn7COf' and:
    		//alphaID('PpQXn7COf', true);
    		//will return '9007199254740989'
    	    $index = "abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    	    if ($passKey !== null) {
    	        // Although this function's purpose is to just make the
    	        // ID short - and not so much secure,
    	        // with this patch by Simon Franz (http://blog.snaky.org/)
    	        // you can optionally supply a password to make it harder
    	        // to calculate the corresponding numeric ID
    	        for ($n = 0; $n<strlen($index); $n++) {
    	            $i[] = substr( $index,$n ,1);
    	        }

    	        $passhash = hash('sha256',$passKey);
    	        $passhash = (strlen($passhash) < strlen($index))
    	            ? hash('sha512',$passKey)
    	            : $passhash;

    	        for ($n=0; $n < strlen($index); $n++) {
    	            $p[] =  substr($passhash, $n ,1);
    	        }

    	        array_multisort($p,  SORT_DESC, $i);
    	        $index = implode($i);
    	    }

    	    $base  = strlen($index);

    	    if ($to_num) {
    	        // Digital number  <<--  alphabet letter code
    	        $in  = strrev($in);
    	        $out = 0;
    	        $len = strlen($in) - 1;
    	        for ($t = 0; $t <= $len; $t++) {
    	            $bcpow = bcpow($base, $len - $t);
    	            $out   = $out + strpos($index, substr($in, $t, 1)) * $bcpow;
    	        }

    	        if (is_numeric($pad_up)) {
    	            $pad_up--;
    	            if ($pad_up > 0) {
    	                $out -= pow($base, $pad_up);
    	            }
    	        }
    	        $out = sprintf('%F', $out);
    	        $out = substr($out, 0, strpos($out, '.'));
    	    } else {
    	        // Digital number  -->>  alphabet letter code
    	        if (is_numeric($pad_up)) {
    	            $pad_up--;
    	            if ($pad_up > 0) {
    	                $in += pow($base, $pad_up);
    	            }
    	        }

    	        $out = "";
    	        for ($t = floor(log($in, $base)); $t >= 0; $t--) {
    	            $bcp = bcpow($base, $t);
    	            $a   = floor($in / $bcp) % $base;
    	            $out = $out . substr($index, $a, 1);
    	            $in  = $in - ($a * $bcp);
    	        }
    	        $out = strrev($out); // reverse
    	    }
    	    return $out;
    	}


    }

?>