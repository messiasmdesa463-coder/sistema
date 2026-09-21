<?php
/**
 * Cadastro de Empresas e Usuário Dono (Self-Service)
 * A empresa nasce com status 'pendente' aguardando aprovação do admin
 */

header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/../../config/Database.php';

use ConfigDatabase;

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Método inválido']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true) ?? $_POST;

$razaoSocial = trim($input['razao_social'] ?? '');
$nomeFantasia = trim($input['nome_fantasia'] ?? '');
$cnpj = trim($input['cnpj'] ?? '');
$email = trim($input['email'] ?? '');
$telefone = trim($input['telefone'] ?? '');
$cidade = trim($input['cidade'] ?? '');
$estado = strtoupper(trim($input['estado'] ?? ''));

// Dados do Dono
$nomeDono = trim($input['nome_dono'] ?? '');
$emailDono = trim($input['email_dono'] ?? $email);
$senha = trim($input['senha'] ?? '');

// Validações
if (empty($razaoSocial) || empty($cnpj) || empty($nomeDono) || empty($emailDono) || empty($senha)) {
    echo json_encode(['success' => false, 'message' => 'Por favor preencha todos os campos obrigatórios.']);
    exit;
}

if (!filter_var($emailDono, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(['success' => false, 'message' => 'E-mail inválido.']);
    exit;
}

if (strlen($senha) < 6) {
    echo json_encode(['success' => false, 'message' => 'A senha deve conter no mínimo 6 caracteres.']);
    exit;
}

$pdo = Database::getConnection();

// Verifica se CNPJ já existe
$checkCnpj = $pdo->prepare("SELECT id FROM empresas WHERE cnpj = :cnpj");
$checkCnpj->execute([':cnpj' => $cnpj]);
if ($checkCnpj->fetch()) {
    echo json_encode(['success' => false, 'message' => 'Este CNPJ já está cadastrado no sistema.']);
    exit;
}

// Verifica se E-mail do dono já existe
$checkUser = $pdo->prepare("SELECT id FROM usuarios WHERE email = :email");
$checkUser->execute([':email' => $emailDono]);
if ($checkUser->fetch()) {
    echo json_encode(['success' => false, 'message' => 'Já existe um usuário cadastrado com este e-mail.']);
    exit;
}

try {
    $pdo->beginTransaction();

    // 1. Cria a empresa com status 'pendente'
    $stmtEmpresa = $pdo->prepare("
        INSERT INTO empresas (razao_social, nome_fantasia, cnpj, email, telefone, cidade, estado, status)
        VALUES (:razao_social, :nome_fantasia, :cnpj, :email, :telefone, :cidade, :estado, 'pendente')
    ");
    $stmtEmpresa->execute([
        ':razao_social' => $razaoSocial,
        ':nome_fantasia' => !empty($nomeFantasia) ? $nomeFantasia : $razaoSocial,
        ':cnpj' => $cnpj,
        ':email' => $email,
        ':telefone' => $telefone,
        ':cidade' => $cidade,
        ':estado' => $estado
    ]);
    $empresaId = (int)$pdo->lastInsertId();

    // 2. Cria o usuário com perfil 'dono'
    $hashSenha = password_hash($senha, PASSWORD_BCRYPT, ['cost' => 12]);
    $stmtUser = $pdo->prepare("
        INSERT INTO usuarios (empresa_id, nome, email, senha, perfil, cargo, ativo)
        VALUES (:empresa_id, :nome, :email, :senha, 'dono', 'Proprietário / Diretor', 1)
    ");
    $stmtUser->execute([
        ':empresa_id' => $empresaId,
        ':nome' => $nomeDono,
        ':email' => $emailDono,
        ':senha' => $hashSenha
    ]);

    $pdo->commit();

    echo json_encode([
        'success' => true,
        'message' => 'Empresa cadastrada com sucesso! O cadastro foi enviado para análise e aprovação do Administrador.',
        'empresa_id' => $empresaId
    ]);

} catch (Exception $e) {
    $pdo->rollBack();
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Erro ao cadastrar empresa: ' . $e->getMessage()]);
}
