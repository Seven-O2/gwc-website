<?php
$directory = '.';
$folders = array_filter(glob($directory . '/*'), 'is_dir');
$result = [];

foreach ($folders as $folder) {
    $year = basename($folder);          // Get the folder name (year)
    $files = [];                        // Initialize an array for files in this folder
    $fileList = glob($folder . '/*');   // Scan the folder for files
    foreach ($fileList as $file) {      // traverse file list
        if (is_file($file)) {           // if it is a file, it will be added
            $files[] = basename($file);
        }
    }
    $result[$year] = $files;    // Map the files to the respective year
}

// Return the result as a JSON object
header('Content-Type: application/json');
echo json_encode($result);
?>
