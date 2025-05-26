import { obtenerUsuarioActual } from './utils.js';
import { getUserById, updateUser } from './api.js';

export function renderizarPerfilUsuario() {
  const user = obtenerUsuarioActual();
  const cont = document.getElementById('formulario-perfil');
  cont.innerHTML = `
    <form id="perfil-form">
      <label>Username:</label>
      <input type="text" value="${user.username}" readonly>
      <label>Email:</label>
      <input type="email" id="email" value="${user.email}" required>
      <label>Nueva Contraseña:</label>
      <input type="password" id="password" placeholder="Dejar en blanco para no cambiar">
      <button type="submit">Guardar Cambios</button>
    </form>
  `;

  document.getElementById('perfil-form').addEventListener('submit', async e => {
    e.preventDefault();
    const email = e.target.email.value.trim();
    const pwd   = e.target.password.value || undefined;

    try {
      // 1) Obtener ETag de la versión actual del recurso
      const { headers } = await getUserById(user.id);
      const etag = headers.get('etag');
      if (!etag) {
        throw new Error('No se recibió ETag del servidor');
      }

      // 2) Llamar a updateUser con If-Match
      await updateUser(user.id,
        { email, password: pwd },
        etag
      );

      alert('Perfil actualizado correctamente');
      window.location.reload();

    } catch (err) {
      alert('Error actualizando perfil: ' + err.message);
    }
  });
}
