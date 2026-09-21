/**
 * GestãoSaaS - Cliente JavaScript AJAX
 */

function switchAuthTab(tab) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.auth-form').forEach(form => form.classList.add('d-none'));
    
    if (tab === 'login') {
        document.getElementById('formLogin').classList.remove('d-none');
        event.target.classList.add('active');
    } else if (tab === 'register') {
        document.getElementById('formRegister').classList.remove('d-none');
        event.target.classList.add('active');
    } else if (tab === 'recover') {
        document.getElementById('formRecover').classList.remove('d-none');
        event.target.classList.add('active');
    }
}

async function handleLogin(e) {
    e.preventDefault();
    const identifier = document.getElementById('loginIdentifier').value;
    const senha = document.getElementById('loginSenha').value;
    const alertBox = document.getElementById('alertBox');

    try {
        const res = await fetch('/modules/auth/login.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ identifier, senha })
        });
        const data = await res.json();

        if (data.success) {
            window.location.href = data.redirect || '/painel.php';
        } else {
            alertBox.className = 'alert-box alert-danger';
            alertBox.textContent = data.message;
            alertBox.classList.remove('d-none');
        }
    } catch (err) {
        alert('Erro ao processar login: ' + err.message);
    }
}

async function handleRegister(e) {
    e.preventDefault();
    const razao_social = document.getElementById('regRazao').value;
    const cnpj = document.getElementById('regCnpj').value;
    const nome_fantasia = document.getElementById('regFantasia').value;
    const nome_dono = document.getElementById('regDono').value;
    const email_dono = document.getElementById('regEmail').value;
    const telefone = document.getElementById('regTelefone').value;
    const senha = document.getElementById('regSenha').value;

    try {
        const res = await fetch('/modules/auth/register_company.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ razao_social, cnpj, nome_fantasia, nome_dono, email_dono, telefone, senha })
        });
        const data = await res.json();
        alert(data.message);
        if (data.success) {
            switchAuthTab('login');
        }
    } catch (err) {
        alert('Erro ao registrar empresa: ' + err.message);
    }
}

async function handleRecover(e) {
    e.preventDefault();
    const email = document.getElementById('recEmail').value;
    try {
        const res = await fetch('/modules/auth/recover_password.php?action=request', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });
        const data = await res.json();
        alert(data.message);
    } catch (err) {
        alert('Erro ao solicitar recuperação: ' + err.message);
    }
}

async function handleLogout() {
    await fetch('/modules/auth/logout.php');
    window.location.href = '/login.php';
}
