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

// Verificar si se ha enviado una imagen
if (!isset($_FILES['image'])) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "No se encontró la imagen"]);
    exit;
}

// Obtener el tipo de imagen (users, vehicles, inventory)
$type = isset($_POST['type']) ? $_POST['type'] : 'users';

// Validar que el tipo sea válido
if (!in_array($type, ['users', 'vehicles', 'inventory'])) {
    $type = 'users'; // Valor por defecto
}

// Crear la carpeta si no existe
$target_dir = "uploads/{$type}/";
if (!file_exists($target_dir)) {
    mkdir($target_dir, 0755, true);
}

// Generar un nombre único para el archivo
$file_extension = strtolower(pathinfo($_FILES["image"]["name"], PATHINFO_EXTENSION));
$unique_filename = uniqid() . '_' . time() . '.' . $file_extension;
$target_file = $target_dir . $unique_filename;

// Validar el tipo de archivo
$allowed_types = ['jpg', 'jpeg', 'png', 'gif'];
if (!in_array($file_extension, $allowed_types)) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Solo se permiten archivos JPG, JPEG, PNG o GIF"]);
    exit;
}

// Validar el tamaño del archivo (máximo 5MB)
$max_size = 5 * 1024 * 1024; // 5MB en bytes
if ($_FILES["image"]["size"] > $max_size) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "El archivo es demasiado grande (máximo 5MB)"]);
    exit;
}

// Intentar subir el archivo
if (move_uploaded_file($_FILES["image"]["tmp_name"], $target_file)) {
    // Construir la URL completa del archivo
    $protocol = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https' : 'http';
    $host = $_SERVER['HTTP_HOST'];
    $file_url = "{$protocol}://{$host}/{$target_file}";
    
    // Responder con éxito y la URL del archivo
    echo json_encode([
        "status" => "success", 
        "url" => $file_url,
        "path" => $unique_filename
    ]);
} else {
    // Error al subir el archivo
    http_response_code(500);
    echo json_encode([
        "status" => "error", 
        "message" => "Error al subir la imagen"
    ]);
}
?> 