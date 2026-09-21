<?php
/**
 * Roteador Inicial do SaaS
 * Se autenticado, encaminha para /painel.php; caso contrário, para /login.php
 */

require_once __DIR__ . '/config/Session.php';
use ConfigSession;

Session::start();

if (isset($_SESSION['user_id'])) {
    header('Location: /painel.php');
    exit;
}

header('Location: /login.php');
exit;
