<?php
/**
 * Configuração da Empresa (Logo, Banner, Tema e Dados Cadastrais)
 */

header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/../../config/Database.php';
require_once __DIR__ . '/../../config/Session.php';

use ConfigDatabase;
use ConfigSession;

Session::requireRole(['admin', 'dono']);

$pdo = Database::getConnection();
$empresaId = Session::getEmpresaId();
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $stmt = $pdo->prepare("SELECT * FROM empresas WHERE id = :id");
    $stmt->execute([':id' => $empresaId]);
    $empresa = $stmt->fetch();

    echo json_encode(['success' => true, 'data' => $empresa]);
    exit;
}

if ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true) ?? $_POST;

    $nomeFantasia = trim($input['nome_fantasia'] ?? '');
    $telefone = trim($input['telefone'] ?? '');
    $endereco = trim($input['endereco'] ?? '');
    $cidade = trim($input['cidade'] ?? '');
    $estado = strtoupper(trim($input['estado'] ?? ''));
    $logoUrl = trim($input['logo_url'] ?? '');
    $bannerUrl = trim($input['banner_url'] ?? '');
    $corTema = trim($input['cor_tema'] ?? '#2563eb');

    $stmt = $pdo->prepare("
        UPDATE empresas 
        SET nome_fantasia = :fantasia, telefone = :telefone, endereco = :endereco,
            cidade = :cidade, estado = :estado, logo_url = :logo, banner_url = :banner, cor_tema = :cor,
            updated_at = NOW()
        WHERE id = :id
    ");
    $stmt->execute([
        ':fantasia' => $nomeFantasia,
        ':telefone' => $telefone,
        ':endereco' => $endereco,
        ':cidade' => $cidade,
        ':estado' => $estado,
        ':logo' => $logoUrl,
        ':banner' => $bannerUrl,
        ':cor' => $corTema,
        ':id' => $empresaId
    ]);

    echo json_encode(['success' => true, 'message' => 'Configurações da empresa salvas com sucesso!']);
    exit;
}
