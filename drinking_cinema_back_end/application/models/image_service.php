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

            $images = array("original" => str_replace("../","http://",$uploadPath));

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

    }

?>