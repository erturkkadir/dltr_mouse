<?php
$location = "";
if(isset($_GET['komut']))
  $location = $_GET['komut'];


$size = $_FILES['audio_data']['size']; //the size in bytes
if($size<0) {
	echo "Size is 0";
}
$input = $_FILES['audio_data']['tmp_name']; //temporary name that PHP gave to the uploaded file
$output = $_FILES['audio_data']['name'].".wav"; //letting the client control the filename is a rather bad idea
//move the file from temp name to local folder using $output name
if (!move_uploaded_file($input, "$location/".$output)) {
	echo "Move uploaded File Error".$input.$output;
} else {
	echo "OK";
}
?>