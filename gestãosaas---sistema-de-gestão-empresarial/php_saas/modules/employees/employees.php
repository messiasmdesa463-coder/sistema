<?php
/**
 * Gerenciamento de Funcionários e Usuários da Empresa
 */

header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/../../config/Database.php';
require_once __DIR__ . '/../../config/Session.php';

use ConfigDatabase;
use ConfigSession;

// Apenas Donos ou Gerentes podem gerenciar funcionários
Session::requireRole(['admin', 'dono', 'gerente']);

$pdo = Database::getConnection();
$empresaId = Session::getEmpresaId();
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $stmt = $pdo->prepare("
        SELECT id, empresa_id, nome, email, perfil, cargo, departamento, ativo, ultimo_acesso, created_at
        FROM usuarios
        WHERE empresa_id = :empresa_id
        ORDER BY perfil ASC, nome ASC
    ");
    $stmt->execute([':empresa_id' => $empresaId]);
    $funcionarios = $stmt->fetchAll();

    echo json_encode(['success' => true, 'data' => $funcionarios]);
    exit;
}

if ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true) ?? $_POST;
    $id = (int)($input['id'] ?? 0);

    $nome = trim($input['nome'] ?? '');
    $email = trim($input['email'] ?? '');
    $perfil = trim($input['perfil'] ?? 'funcionario'); // 'gerente', 'funcionario'
    $cargo = trim($input['cargo'] ?? '');
    $departamento = trim($input['departamento'] ?? '');
    $senha = trim($input['senha'] ?? '');
    $ativo = isset($input['ativo']) ? (int)$input['ativo'] : 1;

    // Não permite criar outro admin global por aqui
    if ($perfil === 'admin') {
        $perfil = 'gerente';
    }

    if (empty($nome) || empty($email)) {
        echo json_encode(['success' => false, 'message' => 'Nome e e-mail são obrigatórios.']);
        exit;
    }

    if ($id > 0) {
        // Atualiza funcionário
        $sql = "UPDATE usuarios SET nome = :nome, email = :email, perfil = :perfil, cargo = :cargo, departamento = :dep, ativo = :ativo ";
        $params = [
            ':nome' => $nome,
            ':email' => $email,
            ':perfil' => $perfil,
            ':cargo' => $cargo,
            ':dep' => $departamento,
            ':ativo' => $ativo,
            ':id' => $id,
            ':empresa_id' => $empresaId
        ];

        if (!empty($senha)) {
            $sql .= ", senha = :senha ";
            $params[':senha'] = password_hash($senha, PASSWORD_BCRYPT, ['cost' => 12]);
        }

        $sql .= " WHERE id = :id AND empresa_id = :empresa_id";
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);

        echo json_encode(['success' => true, 'message' => 'Colaborador atualizado com sucesso!']);
    } else {
        // Novo cadastro
        if (empty($senha)) {
            echo json_encode(['success' => false, 'message' => 'A senha inicial é obrigatória para novo funcionário.']);
            exit;
        }

        // Verifica duplicidade de e-mail
        $check = $pdo->prepare("SELECT id FROM usuarios WHERE email = :email");
        $check->execute([':email' => $email]);
        if ($check->fetch()) {
            echo json_encode(['success' => false, 'message' => 'Já existe um usuário com este e-mail.']);
            exit;
        }

        $stmt = $pdo->prepare("
            INSERT INTO usuarios (empresa_id, nome, email, senha, perfil, cargo, departamento, ativo)
            VALUES (:empresa_id, :nome, :email, :senha, :perfil, :cargo, :dep, :ativo)
        ");
        $stmt->execute([
            ':empresa_id' => $empresaId,
            ':nome' => $nome,
            ':email' => $email,
            ':senha' => password_hash($senha, PASSWORD_BCRYPT, ['cost' => 12]),
            ':perfil' => $perfil,
            ':cargo' => $cargo,
            ':dep' => $departamento,
            ':ativo' => $ativo
        ]);

        echo json_encode(['success' => true, 'message' => 'Funcionário adicionado com sucesso!']);
    }
    exit;
}
