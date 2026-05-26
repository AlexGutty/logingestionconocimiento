/**
 * Login / Registro - Frontend Logic
 */

// Verificar si ya está autenticado
(async () => {
  try {
    const res = await fetch('/api/auth/session');
    const data = await res.json();
    if (data.authenticated) window.location.href = '/dashboard';
  } catch (e) { /* no session */ }
})();

function switchTab(tab) {
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');
  const tabLogin = document.getElementById('tab-login');
  const tabRegister = document.getElementById('tab-register');
  const alertBox = document.getElementById('alert-box');

  alertBox.className = 'alert';
  alertBox.textContent = '';

  if (tab === 'login') {
    loginForm.style.display = 'block';
    registerForm.style.display = 'none';
    tabLogin.classList.add('active');
    tabRegister.classList.remove('active');
  } else {
    loginForm.style.display = 'none';
    registerForm.style.display = 'block';
    tabRegister.classList.add('active');
    tabLogin.classList.remove('active');
  }
}

function showAlert(message, type) {
  const alertBox = document.getElementById('alert-box');
  alertBox.textContent = message;
  alertBox.className = `alert ${type}`;
}

function setLoading(btnId, loading) {
  const btn = document.getElementById(btnId);
  if (loading) {
    btn.disabled = true;
    btn.dataset.text = btn.textContent;
    btn.innerHTML = '<span class="spinner"></span>';
  } else {
    btn.disabled = false;
    btn.textContent = btn.dataset.text;
  }
}

async function handleLogin(e) {
  e.preventDefault();
  setLoading('btn-login', true);

  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: document.getElementById('login-email').value,
        password: document.getElementById('login-password').value
      })
    });

    const data = await res.json();

    if (res.ok) {
      showAlert('¡Bienvenido! Redirigiendo...', 'success');
      setTimeout(() => window.location.href = '/dashboard', 800);
    } else {
      showAlert(data.error, 'error');
      setLoading('btn-login', false);
    }
  } catch {
    showAlert('Error de conexión con el servidor.', 'error');
    setLoading('btn-login', false);
  }
}

async function handleRegister(e) {
  e.preventDefault();
  setLoading('btn-register', true);

  try {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nombre: document.getElementById('reg-name').value,
        email: document.getElementById('reg-email').value,
        password: document.getElementById('reg-password').value
      })
    });

    const data = await res.json();

    if (res.ok) {
      showAlert('¡Cuenta creada! Redirigiendo...', 'success');
      setTimeout(() => window.location.href = '/dashboard', 800);
    } else {
      showAlert(data.error, 'error');
      setLoading('btn-register', false);
    }
  } catch {
    showAlert('Error de conexión con el servidor.', 'error');
    setLoading('btn-register', false);
  }
}
