<?php
// Habilitar CORS para permitir peticiones desde el frontend
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header('Content-Type: application/json');

// Manejar preflight request de CORS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Verificar que sea una petición POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["status" => "error", "message" => "Método no permitido"]);
    exit;
}

// Obtener datos de la petición
$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['fileName']) || empty($data['fileName'])) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Nombre de archivo no proporcionado"]);
    exit;
}

$fileName = $data['fileName'];
$type = isset($data['type']) ? $data['type'] : '';

// Validar el nombre del archivo para evitar path traversal
if (strpos($fileName, '..') !== false || strpos($fileName, '/') !== false) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Nombre de archivo inválido"]);
    exit;
}

// Determinar la ruta del archivo
$filePath = '';

// Si se proporciona un tipo, buscar en esa carpeta específica
if (!empty($type) && in_array($type, ['users', 'vehicles', 'inventory'])) {
    $filePath = "uploads/{$type}/{$fileName}";
} else {
    // Buscar el archivo en todas las carpetas posibles
    $possiblePaths = [
        "uploads/users/{$fileName}",
        "uploads/vehicles/{$fileName}",
        "uploads/inventory/{$fileName}"
    ];
    
    foreach ($possiblePaths as $path) {
        if (file_exists($path)) {
            $filePath = $path;
            break;
        }
    }
}

// Verificar si el archivo existe
if (empty($filePath) || !file_exists($filePath)) {
    http_response_code(404);
    echo json_encode(["status" => "error", "message" => "Archivo no encontrado"]);
    exit;
}

// Intentar eliminar el archivo
if (unlink($filePath)) {
    echo json_encode(["status" => "success", "message" => "Archivo eliminado correctamente"]);
} else {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Error al eliminar el archivo"]);
}
?> 