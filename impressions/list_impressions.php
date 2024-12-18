<?php
// Load the given image and downscale it to the passed max heigt. Returns the image base64 encoded.
function downscaleImage($sourcePath, $maxHeight) {
    list($width, $height) = getimagesize($sourcePath);
    $scale = $maxHeight / $height;
    
    // Calculate new dimensions
    $newWidth = (int)($width * $scale);
    $newHeight = (int)($height * $scale);
    
    // Create a new true color image
    $newImage = imagecreatetruecolor($newWidth, $newHeight);
    
    // Load the source image
    $imageType = exif_imagetype($sourcePath);
    switch ($imageType) {
        case IMAGETYPE_JPEG: $sourceImage = imagecreatefromjpeg($sourcePath); break;
        case IMAGETYPE_PNG:  $sourceImage = imagecreatefrompng($sourcePath); break;
        default: return null; // Unsupported image type
    }
    
    // Resample the image
    imagecopyresampled($newImage, $sourceImage, 0, 0, 0, 0, $newWidth, $newHeight, $width, $height);
    
    // Write resampled image to variable
    ob_start();
    imagejpeg($newImage);
    $imageData = ob_get_contents();
    ob_end_clean();

    // Destroy unused images and encode base64
    imagedestroy($sourceImage);
    imagedestroy($newImage);
    return base64_encode($imageData);
}

header('Content-Type: application/json');
$directory = '.';
$folders = array_filter(glob($directory . '/*'), 'is_dir');
$result = [];

foreach ($folders as $folder) {
    $year = basename($folder);          // Get the folder name (year)
    $events = [];                       // Initialize an array for events in this folder
    $eventList = glob($folder . '/*');  // Scan the folder for events
    foreach ($eventList as $event) {    // traverse file list
        $thumbnail = array_filter(glob($event . '/*'), 'is_file')[0];
        $result[$year][explode('/', $event)[2]] = 'data:image/jpeg;base64,' . downscaleImage($thumbnail, 1000);
    }
}

// Return the result as a JSON object
echo json_encode($result);

?>
