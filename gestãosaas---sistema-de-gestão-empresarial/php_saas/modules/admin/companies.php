<?php
/**
 * Gestão e Aprovação de Empresas pelo Administrador do SaaS
 */

header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/../../config/Database.php';
require_once __DIR__ . '/../../config/Session.php';

use ConfigDatabase;
use ConfigSession;

Session::requireRole(['admin']);

$pdo = Database::getConnection();
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $statusFilter = $_GET['status'] ?? '';
    
    $sql = "
        SELECT e.*, 
            COUNT(DISTINCT u.id) as total_usuarios,
            COUNT(DISTINCT p.id) as total_produtos
        FROM empresas e
        LEFT JOIN usuarios u ON u.empresa_id = e.id
        LEFT JOIN produtos p ON p.empresa_id = e.id
    ";
    $params = [];

    if (!empty($statusFilter)) {
        $sql .= " WHERE e.status = :status ";
        $params[':status'] = $statusFilter;
    }

    $sql .= " GROUP BY e.id ORDER BY e.id DESC";

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $companies = $stmt->fetchAll();

    echo json_encode(['success' => true, 'data' => $companies]);
    exit;
}

if ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true) ?? $_POST;
    $empresaId = (int)($input['empresa_id'] ?? 0);
    $novoStatus = $input['status'] ?? '';

    $statusValidos = ['pendente', 'aprovada', 'rejeitada', 'suspensa'];
    if (!in_array($novoStatus, $statusValidos, true) || $empresaId <= 0) {
        echo json_encode(['success' => false, 'message' => 'Parâmetros inválidos.']);
        exit;
    }

    $stmt = $pdo->prepare("UPDATE empresas SET status = :status WHERE id = :id");
    $stmt->execute([':status' => $novoStatus, ':id' => $empresaId]);

    echo json_encode([
        'success' => true, 
        'message' => "Status da empresa atualizado para: " . strtoupper($novoStatus)
    ]);
    exit;
}
