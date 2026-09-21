<?php
/**
 * Encerramento de Sessão
 */

require_once __DIR__ . '/../../config/Session.php';
use Config\Session;

Session::start();

$_SESSION = [];

if (ini_get("session.use_cookies")) {
    $params = session_get_cookie_params();
    setcookie(
        session_name(),
        '',
        time() - 42000,
        $params["path"],
        $params["domain"],
        $params["secure"],
        $params["httponly"]
    );
}

session_destroy();

if (!empty($_SERVER['HTTP_X_REQUESTED_WITH']) || (isset($_SERVER['CONTENT_TYPE']) && str_contains($_SERVER['CONTENT_TYPE'], 'application/json'))) {
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['success' => true, 'message' => 'Sessão finalizada com sucesso.']);
    exit;
}

header('Location: /login.php');
exit;
