import { obtenerUsuarioActual } from './utils.js';
import { updateUser } from './api.js';

export function renderizarPerfilUsuario() {
  const usuario = obtenerUsuarioActual();
  const contenedor = document.getElementById('formulario-perfil');
  contenedor.innerHTML = `
    <form id="form-perfil">
      <label>Username:</label>
      <input type="text" value="${usuario.username}" readonly>
      <label>Email:</label>
      <input type="email" id="email" value="${usuario.email}" required>
      <label>Nueva Contraseña:</label>
      <input type="password" id="nueva-password" placeholder="Dejar en blanco para no cambiar">
      <button type="submit">Guardar Cambios</button>
    </form>
  `;
  document.getElementById('form-perfil').addEventListener('submit', async e => {
    e.preventDefault();
    const datosActualizados = { email: e.target.email.value, password: e.target['nueva-password'].value || undefined };
    try {
      await updateUser(usuario.id, datosActualizados);
      alert('Perfil actualizado correctamente');
      location.reload();
    } catch (error) {
      alert(`Error actualizando perfil: ${error.message}`);
    }
  });
}