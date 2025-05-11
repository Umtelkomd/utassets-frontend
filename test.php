<?php
// Habilitar CORS para permitir peticiones desde el frontend
header("Access-Control-Allow-Origin: *");
header('Content-Type: application/json');

// Definir las carpetas que deben existir
$folders = [
    'uploads',
    'uploads/users',
    'uploads/vehicles',
    'uploads/inventory'
];

$results = [];

// Verificar cada carpeta
foreach ($folders as $folder) {
    $exists = file_exists($folder);
    $writable = $exists ? is_writable($folder) : false;
    
    $results[$folder] = [
        'exists' => $exists,
        'writable' => $writable
    ];
    
    // Si la carpeta no existe, intentar crearla
    if (!$exists) {
        $created = mkdir($folder, 0755, true);
        $results[$folder]['created'] = $created;
        $results[$folder]['writable'] = $created ? is_writable($folder) : false;
    }
}

// Verificar si podemos escribir un archivo de prueba
$testFile = 'uploads/test_' . time() . '.txt';
$writeTest = file_put_contents($testFile, 'Test file');

$results['write_test'] = [
    'success' => $writeTest !== false,
    'file' => $testFile
];

// Eliminar el archivo de prueba si se creó
if ($writeTest !== false) {
    unlink($testFile);
    $results['write_test']['deleted'] = true;
}

// Verificar la configuración de PHP
$results['php_info'] = [
    'max_upload_size' => ini_get('upload_max_filesize'),
    'post_max_size' => ini_get('post_max_size'),
    'memory_limit' => ini_get('memory_limit'),
    'max_execution_time' => ini_get('max_execution_time')
];

// Devolver los resultados
echo json_encode($results, JSON_PRETTY_PRINT);
?> 