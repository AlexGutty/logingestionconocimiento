/**
 * Dashboard - Frontend Logic
 */
let currentUser = null;
let allUsers = [];
let editingUserId = null;

// ===== Auth Check =====
(async () => {
  try {
    const res = await fetch('/api/auth/session');
    const data = await res.json();
    if (!data.authenticated) {
      window.location.href = '/';
      return;
    }
    currentUser = data.user;
    renderUserInfo();
    loadDashboard();
  } catch {
    window.location.href = '/';
  }
})();

function renderUserInfo() {
  document.getElementById('user-name').textContent = currentUser.nombre;
  document.getElementById('user-role').textContent = currentUser.rol;
  document.getElementById('user-avatar').textContent = currentUser.nombre.charAt(0).toUpperCase();
  document.getElementById('profile-name').value = currentUser.nombre;
  document.getElementById('profile-email').value = currentUser.email;
}

// ===== Navigation =====
function showSection(section, el) {
  document.querySelectorAll('.main-content > section').forEach(s => s.style.display = 'none');
  document.getElementById('section-' + section).style.display = 'block';
  document.querySelectorAll('.sidebar nav a').forEach(a => a.classList.remove('active'));
  if (el) el.classList.add('active');

  if (section === 'users') loadUsers();
}

// ===== Dashboard =====
async function loadDashboard() {
  try {
    const res = await fetch('/api/users');
    if (!res.ok) return;
    allUsers = await res.json();
    document.getElementById('stat-total').textContent = allUsers.length;
    document.getElementById('stat-active').textContent = allUsers.filter(u => u.activo).length;
    document.getElementById('stat-admins').textContent = allUsers.filter(u => u.rol === 'admin').length;
  } catch { /* ignore */ }
}

// ===== Users =====
async function loadUsers() {
  try {
    const res = await fetch('/api/users');
    if (!res.ok) throw new Error();
    allUsers = await res.json();
    renderUsersTable();
  } catch {
    document.getElementById('users-tbody').innerHTML =
      '<tr><td colspan="6" style="text-align:center;padding:40px;color:var(--text-muted)">Error al cargar usuarios</td></tr>';
  }
}

function renderUsersTable() {
  const tbody = document.getElementById('users-tbody');
  if (allUsers.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:40px;color:var(--text-muted)">No hay usuarios</td></tr>';
    return;
  }
  tbody.innerHTML = allUsers.map(u => `
    <tr>
      <td>${escapeHtml(u.nombre)}</td>
      <td>${escapeHtml(u.email)}</td>
      <td><span class="badge ${u.rol}">${u.rol}</span></td>
      <td><span class="badge ${u.activo ? 'activo' : 'inactivo'}">${u.activo ? 'Activo' : 'Inactivo'}</span></td>
      <td>${new Date(u.fecha_creacion).toLocaleDateString('es')}</td>
      <td>
        <button class="btn-icon" onclick="openEditModal(${u.id})" title="Editar">✏️</button>
        ${u.id !== currentUser.id ? `<button class="btn-icon danger" onclick="deleteUser(${u.id})" title="Eliminar">🗑️</button>` : ''}
      </td>
    </tr>
  `).join('');
}

function escapeHtml(text) {
  const d = document.createElement('div');
  d.textContent = text;
  return d.innerHTML;
}

// ===== Modal =====
function openAddModal() {
  editingUserId = null;
  document.getElementById('modal-title').textContent = 'Nuevo Usuario';
  document.getElementById('modal-name').value = '';
  document.getElementById('modal-email').value = '';
  document.getElementById('modal-password').value = '';
  document.getElementById('modal-rol').value = 'usuario';
  document.getElementById('modal-password-group').style.display = 'block';
  document.getElementById('modal-overlay').classList.add('active');
}

function openEditModal(id) {
  const user = allUsers.find(u => u.id === id);
  if (!user) return;
  editingUserId = id;
  document.getElementById('modal-title').textContent = 'Editar Usuario';
  document.getElementById('modal-name').value = user.nombre;
  document.getElementById('modal-email').value = user.email;
  document.getElementById('modal-rol').value = user.rol;
  document.getElementById('modal-password-group').style.display = 'none';
  document.getElementById('modal-overlay').classList.add('active');
}

function closeModal() {
  document.getElementById('modal-overlay').classList.remove('active');
}

async function saveUser() {
  const nombre = document.getElementById('modal-name').value.trim();
  const email = document.getElementById('modal-email').value.trim();
  const rol = document.getElementById('modal-rol').value;

  if (!nombre || !email) {
    showToast('Nombre y email son obligatorios', 'error');
    return;
  }

  if (editingUserId) {
    // Update
    try {
      const user = allUsers.find(u => u.id === editingUserId);
      const res = await fetch(`/api/users/${editingUserId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, email, rol, activo: user.activo })
      });
      if (res.ok) {
        showToast('Usuario actualizado', 'success');
        closeModal();
        loadUsers();
        loadDashboard();
      } else {
        const data = await res.json();
        showToast(data.error, 'error');
      }
    } catch { showToast('Error de conexión', 'error'); }
  } else {
    // Create via register endpoint
    const password = document.getElementById('modal-password').value;
    if (!password || password.length < 6) {
      showToast('Contraseña mínimo 6 caracteres', 'error');
      return;
    }
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, email, password })
      });
      if (res.ok || res.status === 201) {
        showToast('Usuario creado exitosamente', 'success');
        closeModal();
        // Re-login as current user (register auto-logs in as new user)
        // We just reload users
        loadUsers();
        loadDashboard();
      } else {
        const data = await res.json();
        showToast(data.error, 'error');
      }
    } catch { showToast('Error de conexión', 'error'); }
  }
}

async function deleteUser(id) {
  if (!confirm('¿Estás seguro de eliminar este usuario?')) return;
  try {
    const res = await fetch(`/api/users/${id}`, { method: 'DELETE' });
    if (res.ok) {
      showToast('Usuario eliminado', 'success');
      loadUsers();
      loadDashboard();
    } else {
      const data = await res.json();
      showToast(data.error, 'error');
    }
  } catch { showToast('Error de conexión', 'error'); }
}

// ===== Profile =====
async function updateProfile() {
  const nombre = document.getElementById('profile-name').value.trim();
  const email = document.getElementById('profile-email').value.trim();
  if (!nombre || !email) { showToast('Campos obligatorios', 'error'); return; }

  try {
    const res = await fetch(`/api/users/${currentUser.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre, email })
    });
    if (res.ok) {
      currentUser.nombre = nombre;
      currentUser.email = email;
      renderUserInfo();
      showToast('Perfil actualizado', 'success');
    } else {
      const data = await res.json();
      showToast(data.error, 'error');
    }
  } catch { showToast('Error de conexión', 'error'); }
}

// ===== Logout =====
async function logout() {
  await fetch('/api/auth/logout', { method: 'POST' });
  window.location.href = '/';
}

// ===== Toast =====
function showToast(message, type) {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => { toast.style.opacity = '0'; setTimeout(() => toast.remove(), 300); }, 3000);
}
