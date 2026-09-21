<?php
require_once __DIR__ . '/config/Session.php';
use ConfigSession;

Session::checkAuth();
$perfil = Session::getUserRole();
$empresaId = Session::getEmpresaId();
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Painel de Gestão - GestãoSaaS</title>
    <link rel="stylesheet" href="/assets/css/style.css">
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
</head>
<body class="dashboard-body">
    <aside class="sidebar" id="sidebar">
        <div class="sidebar-brand">
            <span class="brand-icon">⚡</span>
            <span class="brand-name">GestãoSaaS</span>
        </div>

        <div class="user-badge">
            <div class="user-avatar"><?= strtoupper(substr($_SESSION['user_nome'], 0, 2)) ?></div>
            <div class="user-info">
                <strong><?= htmlspecialchars($_SESSION['user_nome']) ?></strong>
                <span class="role-pill role-<?= $perfil ?>"><?= strtoupper($perfil) ?></span>
            </div>
        </div>

        <nav class="sidebar-nav">
            <a href="#dashboard" class="nav-item active" onclick="loadModule('dashboard')">📊 Dashboard</a>
            
            <?php if ($perfil === 'admin'): ?>
                <a href="#admin-empresas" class="nav-item" onclick="loadModule('admin-empresas')">🏢 Aprovação de Empresas</a>
            <?php endif; ?>

            <a href="#produtos" class="nav-item" onclick="loadModule('produtos')">📦 Produtos</a>
            <a href="#estoque" class="nav-item" onclick="loadModule('estoque')">🔄 Controle de Estoque</a>
            
            <?php if (in_array($perfil, ['admin', 'dono', 'gerente'])): ?>
                <a href="#funcionarios" class="nav-item" onclick="loadModule('funcionarios')">👥 Equipe / Funcionários</a>
            <?php endif; ?>

            <a href="#tickets" class="nav-item" onclick="loadModule('tickets')">🎫 Tickets de Atendimento</a>

            <?php if (in_array($perfil, ['admin', 'dono'])): ?>
                <a href="#configuracoes" class="nav-item" onclick="loadModule('configuracoes')">⚙️ Dados da Empresa & Logo</a>
            <?php endif; ?>
        </nav>

        <div class="sidebar-footer">
            <button class="btn btn-outline btn-sm btn-block" onclick="handleLogout()">Encerrar Sessão</button>
        </div>
    </aside>

    <main class="main-content">
        <header class="topbar">
            <div class="company-badge-header">
                <span class="company-name"><?= htmlspecialchars($_SESSION['empresa_nome']) ?></span>
            </div>
            <div class="topbar-actions">
                <span class="badge-date"><?= date('d/m/Y') ?></span>
                <button class="btn btn-sm btn-danger" onclick="handleLogout()">Sair</button>
            </div>
        </header>

        <div class="container-fluid" id="contentArea">
            <div class="loading-spinner">Carregando painel...</div>
        </div>
    </main>

    <script src="/assets/js/app.js"></script>
</body>
</html>
