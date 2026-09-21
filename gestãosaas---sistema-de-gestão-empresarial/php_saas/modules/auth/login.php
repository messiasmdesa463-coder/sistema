<?php
/**
 * Autenticação de Usuário (E-mail ou CNPJ)
 * Resposta formatada em JSON com tratamento de aprovação de empresa
 */

header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/../../config/Database.php';
require_once __DIR__ . '/../../config/Session.php';

use ConfigDatabase;
use ConfigSession;

Session::start();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Método não permitido']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true) ?? $_POST;
$identifier = trim($input['identifier'] ?? ''); // Pode ser e-mail ou CNPJ
$senha = trim($input['senha'] ?? '');

if (empty($identifier) || empty($senha)) {
    echo json_encode(['success' => false, 'message' => 'Informe o E-mail ou CNPJ e a senha.']);
    exit;
}

$pdo = Database::getConnection();

// Remove caracteres não numéricos se parecer um CNPJ
$cleanCnpj = preg_replace('/\D/', '', $identifier);

if (strlen($cleanCnpj) === 14) {
    // Busca por CNPJ da empresa associada
    $stmt = $pdo->prepare("
        SELECT u.*, e.razao_social, e.nome_fantasia, e.status as empresa_status, e.logo_url, e.banner_url
        FROM usuarios u
        INNER JOIN empresas e ON u.empresa_id = e.id
        WHERE REPLACE(REPLACE(REPLACE(REPLACE(e.cnpj, '.', ''), '/', ''), '-', ''), ' ', '') = :cnpj
        AND u.perfil IN ('dono', 'gerente')
        AND u.ativo = 1
        LIMIT 1
    ");
    $stmt->execute([':cnpj' => $cleanCnpj]);
    $user = $stmt->fetch();
} else {
    // Busca por E-mail do usuário
    $stmt = $pdo->prepare("
        SELECT u.*, e.razao_social, e.nome_fantasia, e.status as empresa_status, e.logo_url, e.banner_url
        FROM usuarios u
        LEFT JOIN empresas e ON u.empresa_id = e.id
        WHERE u.email = :email
        LIMIT 1
    ");
    $stmt->execute([':email' => $identifier]);
    $user = $stmt->fetch();
}

if (!$user || !password_verify($senha, $user['senha'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Credenciais incorretas. Verifique seus dados.']);
    exit;
}

// Verifica se o usuário está ativo
if ((int)$user['ativo'] !== 1) {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Sua conta de usuário está inativa. Contate o administrador.']);
    exit;
}

// Se não for admin global, verifica o status da empresa
if ($user['perfil'] !== 'admin') {
    if (empty($user['empresa_status'])) {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'Usuário sem empresa vinculada.']);
        exit;
    }

    if ($user['empresa_status'] === 'pendente') {
        http_response_code(403);
        echo json_encode([
            'success' => false, 
            'message' => 'Sua empresa está em análise e aguarda aprovação pelo administrador do SaaS.'
        ]);
        exit;
    }

    if ($user['empresa_status'] === 'rejeitada' || $user['empresa_status'] === 'suspensa') {
        http_response_code(403);
        echo json_encode([
            'success' => false, 
            'message' => 'Sua empresa está com status ' . strtoupper($user['empresa_status']) . '. Entre em contato com o suporte.'
        ]);
        exit;
    }
}

// Regenera ID de sessão contra session fixation
session_regenerate_id(true);

$_SESSION['user_id'] = (int)$user['id'];
$_SESSION['user_nome'] = $user['nome'];
$_SESSION['user_email'] = $user['email'];
$_SESSION['user_perfil'] = $user['perfil'];
$_SESSION['empresa_id'] = $user['empresa_id'] ? (int)$user['empresa_id'] : null;
$_SESSION['empresa_nome'] = $user['nome_fantasia'] ?? $user['razao_social'] ?? 'Administração SaaS';

// Atualiza último acesso
$updateAccess = $pdo->prepare("UPDATE usuarios SET ultimo_acesso = NOW() WHERE id = :id");
$updateAccess->execute([':id' => $user['id']]);

echo json_encode([
    'success' => true,
    'message' => 'Login realizado com sucesso!',
    'user' => [
        'id' => $user['id'],
        'nome' => $user['nome'],
        'email' => $user['email'],
        'perfil' => $user['perfil'],
        'empresa_id' => $user['empresa_id'],
        'empresa_nome' => $_SESSION['empresa_nome']
    ],
    'redirect' => '/painel.php'
]);
