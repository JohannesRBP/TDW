import {
  getUserByName,
  createUser,
  loginAPI,
  logout,
  getUsers
} from './api.js';

/**
 * Muestra formulario de registro solicitando email.
 */
export async function mostrarFormularioEmail(username, password) {
  const sec = document.getElementById('form-login');
  sec.innerHTML = `
    <div class="registro-container">
      <h2>Registro</h2>
      <form id="form-email" class="registro-form">
        <input type="text" id="user-name" value="${username}" readonly>
        <input type="password" id="pwd" value="${password}" readonly>
        <input type="email" id="email" placeholder="Email" required>
        <button type="submit">Registrarse</button>
      </form>
    </div>
  `;
  document.getElementById('form-email').addEventListener('submit', async e => {
    e.preventDefault();
    const email = e.target.email.value.trim();
    try {
      await createUser({ username, password, email });
      alert('Registrado. Espera activación.');
      window.location.reload();
    } catch (err) {
      alert('Error: ' + err.message);
    }
  });
}

/**
 * Inicializa registro y validación básica de username.
 */
export async function inicializarRegistro() {
  const form = document.getElementById('form-login');
  const usernameInput = document.getElementById('user-name');
  const pwdInput = document.getElementById('pwd');

  // Validación al teclear username
  usernameInput.addEventListener('input', async e => {
    const name = e.target.value.trim();
    if (!name) return;
    try {
      await getUserByName(name);
      // Usuario ya existe
      console.warn('El nombre de usuario ya existe');
    } catch (error) {
      if (error.message.includes('404')) {
        // Nombre disponible
        console.info('Nombre de usuario disponible');
      }
    }
  });

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const username = usernameInput.value.trim();
    const password = pwdInput.value;
    try {
      await getUserByName(username);
      const data = await loginAPI(username, password);
      await manejarLoginExitoso(data, username);
    } catch (err) {
      if (err.message.includes('404')) {
        mostrarFormularioEmail(username, password);
      } else if (err.message.includes('401')) {
        alert('Contraseña incorrecta');
      } else {
        alert('Error: ' + err.message);
      }
    }
  });
}

/**
 * Maneja login exitoso: guarda token y redirige según rol.
 */
export async function manejarLoginExitoso(data, username) {
  sessionStorage.setItem('access_token', data.access_token);
  sessionStorage.setItem('username', username);

  const usersResp = await getUsers();
  const userObj = usersResp.users.find(u => u.user.username === username);
  sessionStorage.setItem('user', JSON.stringify(userObj.user));

  const role = userObj.user.role.toLowerCase();
  if (role === 'reader') {
    window.location.href = '/front/app/views/personas/reader.html';
  } else {
    window.location.href = '/front/app/views/personas/writer.html';
  }
}

/**
 * Inicializa el botón de logout.
 */
export function inicializarLogout() {
  const botonLogout = document.getElementById('logout-btn');
  if (botonLogout) {
    botonLogout.onclick = () => {
      logout();
      sessionStorage.clear();
      window.location.href = '/front/app/views/home/index.html';
    };
  }
}
