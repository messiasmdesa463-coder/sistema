<?php
/**
 * Gerenciamento de Sessão e Controle de Acesso (RBAC)
 */

namespace Config;

class Session {
    public static function start(): void {
        if (session_status() === PHP_SESSION_NONE) {
            // Parâmetros de segurança de cookie de sessão
            ini_set('session.cookie_httponly', '1');
            ini_set('session.use_only_cookies', '1');
            ini_set('session.cookie_samesite', 'Lax');
            
            session_start();
        }
    }

    public static function checkAuth(): void {
        self::start();
        if (!isset($_SESSION['user_id'])) {
            if (self::isAjax()) {
                http_response_code(401);
                header('Content-Type: application/json');
                echo json_encode(['success' => false, 'message' => 'Sessão expirada. Faça login novamente.']);
                exit;
            }
            header('Location: /login.php');
            exit;
        }
    }

    public static function requireRole(array $allowedRoles): void {
        self::checkAuth();
        $userRole = $_SESSION['user_perfil'] ?? '';
        if (!in_array($userRole, $allowedRoles, true)) {
            if (self::isAjax()) {
                http_response_code(403);
                header('Content-Type: application/json');
                echo json_encode(['success' => false, 'message' => 'Acesso não autorizado para o seu perfil.']);
                exit;
            }
            header('Location: /painel.php?error=unauthorized');
            exit;
        }
    }

    public static function getEmpresaId(): ?int {
        self::start();
        return $_SESSION['empresa_id'] ?? null;
    }

    public static function getUserId(): ?int {
        self::start();
        return $_SESSION['user_id'] ?? null;
    }

    public static function getUserRole(): ?string {
        self::start();
        return $_SESSION['user_perfil'] ?? null;
    }

    private static function isAjax(): bool {
        return (!empty($_SERVER['HTTP_X_REQUESTED_WITH']) && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) === 'xmlhttprequest') 
            || (isset($_SERVER['CONTENT_TYPE']) && str_contains($_SERVER['CONTENT_TYPE'], 'application/json'));
    }
}
