<?php
/**
 * Estatísticas e Indicadores para o Dashboard da Empresa e Admin
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

if ($userRole === 'admin') {
    // Estatísticas Globais do SaaS
    $totalEmpresas = $pdo->query("SELECT COUNT(*) FROM empresas")->fetchColumn();
    $empresasPendentes = $pdo->query("SELECT COUNT(*) FROM empresas WHERE status = 'pendente'")->fetchColumn();
    $empresasAprovadas = $pdo->query("SELECT COUNT(*) FROM empresas WHERE status = 'aprovada'")->fetchColumn();
    $totalUsuarios = $pdo->query("SELECT COUNT(*) FROM usuarios")->fetchColumn();
    $totalTickets = $pdo->query("SELECT COUNT(*) FROM tickets WHERE status IN ('aberto', 'em_atendimento')")->fetchColumn();

    echo json_encode([
        'success' => true,
        'type' => 'admin',
        'stats' => [
            'totalEmpresas' => (int)$totalEmpresas,
            'empresasPendentes' => (int)$empresasPendentes,
            'empresasAprovadas' => (int)$empresasAprovadas,
            'totalUsuarios' => (int)$totalUsuarios,
            'ticketsAbertos' => (int)$totalTickets
        ]
    ]);
    exit;
}

// Estatísticas da Empresa (Tenant)
$stmtProd = $pdo->prepare("
    SELECT 
        COUNT(*) as total_produtos,
        COALESCE(SUM(estoque_atual * preco_venda), 0) as valor_total_estoque,
        COALESCE(SUM(CASE WHEN estoque_atual <= estoque_minimo THEN 1 ELSE 0 END), 0) as estoque_critico
    FROM produtos
    WHERE empresa_id = :empresa_id AND ativo = 1
");
$stmtProd->execute([':empresa_id' => $empresaId]);
$prodStats = $stmtProd->fetch();

// Movimentações no mês atual
$stmtMov = $pdo->prepare("
    SELECT COUNT(*) as total_movimentacoes,
        COALESCE(SUM(CASE WHEN tipo = 'entrada' THEN quantidade ELSE 0 END), 0) as total_entradas,
        COALESCE(SUM(CASE WHEN tipo = 'saida' THEN quantidade ELSE 0 END), 0) as total_saidas
    FROM movimentacoes_estoque
    WHERE empresa_id = :empresa_id AND MONTH(created_at) = MONTH(CURRENT_DATE()) AND YEAR(created_at) = YEAR(CURRENT_DATE())
");
$stmtMov->execute([':empresa_id' => $empresaId]);
$movStats = $stmtMov->fetch();

// Tickets da empresa
$stmtTicket = $pdo->prepare("
    SELECT COUNT(*) FROM tickets 
    WHERE empresa_id = :empresa_id AND status IN ('aberto', 'em_atendimento')
");
$stmtTicket->execute([':empresa_id' => $empresaId]);
$ticketsAbertos = (int)$stmtTicket->fetchColumn();

echo json_encode([
    'success' => true,
    'type' => 'tenant',
    'stats' => [
        'totalProdutos' => (int)$prodStats['total_produtos'],
        'valorTotalEstoque' => (float)$prodStats['valor_total_estoque'],
        'itensEstoqueCritico' => (int)$prodStats['estoque_critico'],
        'movimentacoesMes' => (int)$movStats['total_movimentacoes'],
        'totalEntradasMes' => (int)$movStats['total_entradas'],
        'totalSaidasMes' => (int)$movStats['total_saidas'],
        'ticketsAbertos' => $ticketsAbertos
    ]
]);
