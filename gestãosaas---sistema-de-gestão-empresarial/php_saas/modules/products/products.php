<?php
/**
 * Gerenciamento de Produtos (Multi-tenant isolado por empresa_id)
 */

header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/../../config/Database.php';
require_once __DIR__ . '/../../config/Session.php';

use ConfigDatabase;
use ConfigSession;

Session::requireRole(['admin', 'dono', 'gerente', 'funcionario']);

$pdo = Database::getConnection();
$empresaId = Session::getEmpresaId();
$userRole = Session::getUserRole();
$method = $_SERVER['REQUEST_METHOD'];

// Para Admin global, pode visualizar produtos de uma empresa específica via parâmetro
if ($userRole === 'admin' && isset($_GET['empresa_id'])) {
    $empresaId = (int)$_GET['empresa_id'];
}

if (!$empresaId && $userRole !== 'admin') {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Empresa não selecionada.']);
    exit;
}

if ($method === 'GET') {
    $search = trim($_GET['q'] ?? '');
    $categoria = trim($_GET['categoria'] ?? '');

    $sql = "SELECT * FROM produtos WHERE empresa_id = :empresa_id AND ativo = 1";
    $params = [':empresa_id' => $empresaId];

    if (!empty($search)) {
        $sql .= " AND (nome LIKE :q OR sku LIKE :q OR codigo_barras LIKE :q)";
        $params[':q'] = "%$search%";
    }
    if (!empty($categoria)) {
        $sql .= " AND categoria = :categoria";
        $params[':categoria'] = $categoria;
    }

    $sql .= " ORDER BY nome ASC";
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $produtos = $stmt->fetchAll();

    echo json_encode(['success' => true, 'data' => $produtos]);
    exit;
}

// Modificações exigem perfil dono ou gerente
if (in_array($method, ['POST', 'PUT', 'DELETE'], true)) {
    if (!in_array($userRole, ['admin', 'dono', 'gerente'], true)) {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'Apenas donos ou gerentes podem alterar produtos.']);
        exit;
    }
}

if ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true) ?? $_POST;
    $id = (int)($input['id'] ?? 0);

    $nome = trim($input['nome'] ?? '');
    $sku = trim($input['sku'] ?? '');
    $categoria = trim($input['categoria'] ?? 'Geral');
    $precoCusto = (float)($input['preco_custo'] ?? 0);
    $precoVenda = (float)($input['preco_venda'] ?? 0);
    $estoqueMinimo = (int)($input['estoque_minimo'] ?? 5);
    $unidade = trim($input['unidade_medida'] ?? 'UN');
    $localizacao = trim($input['localizacao'] ?? '');

    if (empty($nome) || empty($sku)) {
        echo json_encode(['success' => false, 'message' => 'Nome e SKU são campos obrigatórios.']);
        exit;
    }

    if ($id > 0) {
        // Atualização
        $stmt = $pdo->prepare("
            UPDATE produtos 
            SET nome = :nome, sku = :sku, categoria = :categoria, preco_custo = :custo, 
                preco_venda = :venda, estoque_minimo = :minimo, unidade_medida = :unidade, localizacao = :loc
            WHERE id = :id AND empresa_id = :empresa_id
        ");
        $stmt->execute([
            ':nome' => $nome,
            ':sku' => $sku,
            ':categoria' => $categoria,
            ':custo' => $precoCusto,
            ':venda' => $precoVenda,
            ':minimo' => $estoqueMinimo,
            ':unidade' => $unidade,
            ':loc' => $localizacao,
            ':id' => $id,
            ':empresa_id' => $empresaId
        ]);
        echo json_encode(['success' => true, 'message' => 'Produto atualizado com sucesso!']);
    } else {
        // Cadastro
        $estoqueInicial = (int)($input['estoque_atual'] ?? 0);
        $stmt = $pdo->prepare("
            INSERT INTO produtos (empresa_id, nome, sku, categoria, preco_custo, preco_venda, estoque_atual, estoque_minimo, unidade_medida, localizacao)
            VALUES (:empresa_id, :nome, :sku, :categoria, :custo, :venda, :estoque, :minimo, :unidade, :loc)
        ");
        $stmt->execute([
            ':empresa_id' => $empresaId,
            ':nome' => $nome,
            ':sku' => $sku,
            ':categoria' => $categoria,
            ':custo' => $precoCusto,
            ':venda' => $precoVenda,
            ':estoque' => $estoqueInicial,
            ':minimo' => $estoqueMinimo,
            ':unidade' => $unidade,
            ':loc' => $localizacao
        ]);
        echo json_encode(['success' => true, 'message' => 'Produto cadastrado com sucesso!', 'id' => $pdo->lastInsertId()]);
    }
    exit;
}

if ($method === 'DELETE') {
    $input = json_decode(file_get_contents('php://input'), true) ?? $_GET;
    $id = (int)($input['id'] ?? 0);

    // Soft delete
    $stmt = $pdo->prepare("UPDATE produtos SET ativo = 0 WHERE id = :id AND empresa_id = :empresa_id");
    $stmt->execute([':id' => $id, ':empresa_id' => $empresaId]);

    echo json_encode(['success' => true, 'message' => 'Produto removido com sucesso.']);
    exit;
}
