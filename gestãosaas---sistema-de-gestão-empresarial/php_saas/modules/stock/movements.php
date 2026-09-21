<?php
/**
 * Movimentações de Estoque (Entradas, Saídas, Ajustes e Histórico)
 * Utiliza transações ACID para garantir integridade do saldo
 */

header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/../../config/Database.php';
require_once __DIR__ . '/../../config/Session.php';

use ConfigDatabase;
use ConfigSession;

Session::requireRole(['admin', 'dono', 'gerente', 'funcionario']);

$pdo = Database::getConnection();
$empresaId = Session::getEmpresaId();
$userId = Session::getUserId();
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $produtoId = isset($_GET['produto_id']) ? (int)$_GET['produto_id'] : null;
    $tipo = $_GET['tipo'] ?? '';

    $sql = "
        SELECT m.*, p.nome as produto_nome, p.sku as produto_sku, u.nome as usuario_nome
        FROM movimentacoes_estoque m
        INNER JOIN produtos p ON m.produto_id = p.id
        INNER JOIN usuarios u ON m.usuario_id = u.id
        WHERE m.empresa_id = :empresa_id
    ";
    $params = [':empresa_id' => $empresaId];

    if ($produtoId) {
        $sql .= " AND m.produto_id = :produto_id";
        $params[':produto_id'] = $produtoId;
    }
    if (!empty($tipo)) {
        $sql .= " AND m.tipo = :tipo";
        $params[':tipo'] = $tipo;
    }

    $sql .= " ORDER BY m.id DESC LIMIT 100";
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $movimentacoes = $stmt->fetchAll();

    echo json_encode(['success' => true, 'data' => $movimentacoes]);
    exit;
}

if ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true) ?? $_POST;

    $produtoId = (int)($input['produto_id'] ?? 0);
    $tipo = $input['tipo'] ?? ''; // 'entrada', 'saida', 'ajuste', 'devolucao'
    $quantidade = (int)($input['quantidade'] ?? 0);
    $motivo = trim($input['motivo'] ?? '');
    $docRef = trim($input['documento_ref'] ?? '');
    $valorUnitario = isset($input['valor_unitario']) ? (float)$input['valor_unitario'] : null;

    $tiposPermitidos = ['entrada', 'saida', 'ajuste', 'devolucao'];
    if (!in_array($tipo, $tiposPermitidos, true) || $quantidade <= 0 || $produtoId <= 0 || empty($motivo)) {
        echo json_encode(['success' => false, 'message' => 'Preencha produto, tipo válido, quantidade positiva e motivo.']);
        exit;
    }

    try {
        $pdo->beginTransaction();

        // 1. Bloqueia a linha do produto para leitura/escrita atômica
        $stmtProd = $pdo->prepare("SELECT estoque_atual FROM produtos WHERE id = :id AND empresa_id = :empresa_id FOR UPDATE");
        $stmtProd->execute([':id' => $produtoId, ':empresa_id' => $empresaId]);
        $prod = $stmtProd->fetch();

        if (!$prod) {
            $pdo->rollBack();
            echo json_encode(['success' => false, 'message' => 'Produto não encontrado.']);
            exit;
        }

        $saldoAnterior = (int)$prod['estoque_atual'];

        // 2. Calcula novo saldo
        if ($tipo === 'entrada' || $tipo === 'devolucao') {
            $saldoPosterior = $saldoAnterior + $quantidade;
        } elseif ($tipo === 'saida') {
            if ($saldoAnterior < $quantidade) {
                $pdo->rollBack();
                echo json_encode([
                    'success' => false, 
                    'message' => "Saldo insuficiente em estoque. Disponível: {$saldoAnterior}, Solicitado: {$quantidade}"
                ]);
                exit;
            }
            $saldoPosterior = $saldoAnterior - $quantidade;
        } elseif ($tipo === 'ajuste') {
            // Em ajuste, a quantidade informada pode ser o novo estoque absoluto
            $saldoPosterior = $quantidade;
            $quantidade = abs($saldoPosterior - $saldoAnterior);
        } else {
            $saldoPosterior = $saldoAnterior;
        }

        // 3. Atualiza o estoque do produto
        $stmtUpdate = $pdo->prepare("UPDATE produtos SET estoque_atual = :novo_saldo, updated_at = NOW() WHERE id = :id");
        $stmtUpdate->execute([':novo_saldo' => $saldoPosterior, ':id' => $produtoId]);

        // 4. Registra a movimentação na tabela de auditoria
        $stmtMov = $pdo->prepare("
            INSERT INTO movimentacoes_estoque 
            (empresa_id, produto_id, usuario_id, tipo, quantidade, saldo_anterior, saldo_posterior, motivo, documento_ref, valor_unitario)
            VALUES (:empresa_id, :produto_id, :usuario_id, :tipo, :quantidade, :saldo_anterior, :saldo_posterior, :motivo, :doc_ref, :valor)
        ");
        $stmtMov->execute([
            ':empresa_id' => $empresaId,
            ':produto_id' => $produtoId,
            ':usuario_id' => $userId,
            ':tipo' => $tipo,
            ':quantidade' => $quantidade,
            ':saldo_anterior' => $saldoAnterior,
            ':saldo_posterior' => $saldoPosterior,
            ':motivo' => $motivo,
            ':doc_ref' => $docRef,
            ':valor' => $valorUnitario
        ]);

        $pdo->commit();

        echo json_encode([
            'success' => true,
            'message' => 'Movimentação realizada com sucesso!',
            'novo_saldo' => $saldoPosterior
        ]);

    } catch (Exception $e) {
        $pdo->rollBack();
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Erro ao processar movimentação: ' . $e->getMessage()]);
    }
    exit;
}
