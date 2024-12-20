<?php

header('Content-Type: application/json');
$result = [];

// If year and folder is set, extract the image links to it
if(isset($_GET['year']) && isset($_GET['folder'])) {
    $directory = './' . $_GET['year'] . '/' . $_GET['folder'];
    $images = array_filter(glob($directory . '/*'), 'is_file');
    foreach($images as $image) {        // Extract last part of path (./YYYY/XXXX/THIS)
        $tmp = explode('/', $image);
        array_push($result, end($tmp));
    }
}
echo json_encode($result);
?>
