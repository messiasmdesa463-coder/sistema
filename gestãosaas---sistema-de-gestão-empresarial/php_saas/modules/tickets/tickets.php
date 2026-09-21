<?php
/**
 * Central de Suporte e Tickets de Atendimento
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
$userRole = Session::getUserRole();
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $ticketId = isset($_GET['id']) ? (int)$_GET['id'] : null;

    if ($ticketId) {
        // Retorna o ticket específico com todas as mensagens
        $stmt = $pdo->prepare("
            SELECT t.*, u.nome as solicitante_nome, e.nome_fantasia as empresa_nome
            FROM tickets t
            INNER JOIN usuarios u ON t.usuario_id = u.id
            INNER JOIN empresas e ON t.empresa_id = e.id
            WHERE t.id = :id AND (t.empresa_id = :empresa_id OR :is_admin = 'admin')
        ");
        $stmt->execute([
            ':id' => $ticketId,
            ':empresa_id' => $empresaId,
            ':is_admin' => $userRole
        ]);
        $ticket = $stmt->fetch();

        if (!$ticket) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Ticket não encontrado.']);
            exit;
        }

        // Mensagens do ticket
        $stmtMsg = $pdo->prepare("
            SELECT tm.*, u.nome as usuario_nome, u.perfil as usuario_perfil
            FROM ticket_mensagens tm
            INNER JOIN usuarios u ON tm.usuario_id = u.id
            WHERE tm.ticket_id = :ticket_id
            ORDER BY tm.created_at ASC
        ");
        $stmtMsg->execute([':ticket_id' => $ticketId]);
        $ticket['mensagens'] = $stmtMsg->fetchAll();

        echo json_encode(['success' => true, 'data' => $ticket]);
        exit;
    }

    // Lista tickets
    $sql = "
        SELECT t.*, u.nome as solicitante_nome, COUNT(tm.id) as total_respostas
        FROM tickets t
        INNER JOIN usuarios u ON t.usuario_id = u.id
        LEFT JOIN ticket_mensagens tm ON tm.ticket_id = t.id
        WHERE (t.empresa_id = :empresa_id OR :is_admin = 'admin')
        GROUP BY t.id
        ORDER BY FIELD(t.status, 'aberto', 'em_atendimento', 'resolvido', 'fechado'), t.created_at DESC
    ";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        ':empresa_id' => $empresaId,
        ':is_admin' => $userRole
    ]);
    $tickets = $stmt->fetchAll();

    echo json_encode(['success' => true, 'data' => $tickets]);
    exit;
}

if ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true) ?? $_POST;
    $action = $input['action'] ?? 'create';

    if ($action === 'create') {
        $titulo = trim($input['titulo'] ?? '');
        $categoria = $input['categoria'] ?? 'suporte';
        $prioridade = $input['prioridade'] ?? 'media';
        $descricao = trim($input['descricao'] ?? '');

        if (empty($titulo) || empty($descricao)) {
            echo json_encode(['success' => false, 'message' => 'Título e descrição detalhada são obrigatórios.']);
            exit;
        }

        $stmt = $pdo->prepare("
            INSERT INTO tickets (empresa_id, usuario_id, titulo, categoria, prioridade, status, descricao)
            VALUES (:empresa_id, :usuario_id, :titulo, :categoria, :prioridade, 'aberto', :descricao)
        ");
        $stmt->execute([
            ':empresa_id' => $empresaId,
            ':usuario_id' => $userId,
            ':titulo' => $titulo,
            ':categoria' => $categoria,
            ':prioridade' => $prioridade,
            ':descricao' => $descricao
        ]);

        echo json_encode(['success' => true, 'message' => 'Ticket de atendimento aberto com sucesso!', 'id' => $pdo->lastInsertId()]);
        exit;
    }

    if ($action === 'reply') {
        $ticketId = (int)($input['ticket_id'] ?? 0);
        $mensagem = trim($input['mensagem'] ?? '');

        if ($ticketId <= 0 || empty($mensagem)) {
            echo json_encode(['success' => false, 'message' => 'Mensagem não pode ser vazia.']);
            exit;
        }

        $stmt = $pdo->prepare("
            INSERT INTO ticket_mensagens (ticket_id, usuario_id, mensagem)
            VALUES (:ticket_id, :usuario_id, :mensagem)
        ");
        $stmt->execute([
            ':ticket_id' => $ticketId,
            ':usuario_id' => $userId,
            ':mensagem' => $mensagem
        ]);

        // Atualiza status se estava resolvido ou fechado
        $pdo->prepare("UPDATE tickets SET updated_at = NOW(), status = 'em_atendimento' WHERE id = :id AND status = 'aberto'")->execute([':id' => $ticketId]);

        echo json_encode(['success' => true, 'message' => 'Resposta enviada com sucesso!']);
        exit;
    }

    if ($action === 'status') {
        $ticketId = (int)($input['ticket_id'] ?? 0);
        $novoStatus = $input['status'] ?? '';
        $validos = ['aberto', 'em_atendimento', 'resolvido', 'fechado'];

        if (!in_array($novoStatus, $validos, true)) {
            echo json_encode(['success' => false, 'message' => 'Status inválido.']);
            exit;
        }

        $stmt = $pdo->prepare("UPDATE tickets SET status = :status, updated_at = NOW() WHERE id = :id");
        $stmt->execute([':status' => $novoStatus, ':id' => $ticketId]);

        echo json_encode(['success' => true, 'message' => 'Status do ticket atualizado para: ' . $novoStatus]);
        exit;
    }
}
