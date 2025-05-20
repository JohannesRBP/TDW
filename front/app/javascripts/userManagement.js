import { getUsers, updateUser, deleteUser, getUserById } from './api.js';

/**
 * Renderiza la tabla de usuarios en #lista-usuarios
 */
export async function renderizarGestionUsuarios() {
  const contenedor = document.getElementById('lista-usuarios');
  try {
    const { users } = await getUsers();
    contenedor.innerHTML = `
      <table>
        <thead>
          <tr>
            <th>Username</th>
            <th>Email</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${users.map(u => `
            <tr>
              <td>${u.user.username}</td>
              <td>${u.user.email}</td>
              <td>
                <select onchange="cambiarRolUsuario(${u.user.id}, this.value)">
                  <option ${u.user.role==='READER'?'selected':''}>READER</option>
                  <option ${u.user.role==='WRITER'?'selected':''}>WRITER</option>
                  <option ${u.user.role==='INACTIVE'?'selected':''}>INACTIVE</option>
                </select>
              </td>
              <td>
                <button onclick="eliminarUsuario(${u.user.id})">Eliminar</button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  } catch (err) {
    contenedor.innerHTML = `<div class="error">Error cargando usuarios: ${err.message}</div>`;
  }
}

/**
 * Cambia el rol de un usuario y refresca la tabla
 */
export async function cambiarRolUsuario(userId, nuevoRol) {
  try {
    // 1) Obtener el ETag
    const { headers } = await getUserById(userId);
    console.log(headers)
    const etag = headers.get('etag');
    console.log(etag)
    if (!etag) throw new Error('No se recibió ETag');

    // 2) Llamar a updateUser pasando el etag
    await updateUser(userId, { role: nuevoRol }, etag);

    // 3) Refrescar tabla
    await renderizarGestionUsuarios();
  } catch (err) {
    alert(`Error actualizando rol: ${err.message}`);
  }
}
/**
 * Elimina un usuario y refresca la tabla
 */
export async function eliminarUsuario(userId) {
  if (!confirm('¿Eliminar usuario y todos sus datos asociados?')) return;
  try {
    await deleteUser(userId);
    await renderizarGestionUsuarios();
  } catch (err) {
    alert(`Error eliminando usuario: ${err.message}`);
  }
}

// Exponer en window las funciones necesarias
window.renderizarGestionUsuarios = renderizarGestionUsuarios;
window.cambiarRolUsuario       = cambiarRolUsuario;
window.eliminarUsuario         = eliminarUsuario;
