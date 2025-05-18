import './api.js';
import { inicializarRegistro, inicializarLogout } from './auth.js';
import { renderizarContenido } from './render.js';
import './userManagement.js';
import './profile.js';
import { mostrarFormularioCrear, mostrarFormularioEditar, cerrarFormulario } from './forms.js';
import { handleDelete } from './crud.js';
import { cargarDatos, datosGlobales } from './data.js';

async function inicializarApp() {
  const token = sessionStorage.getItem('access_token');
  await cargarDatos();
  renderizarContenido(datosGlobales);
  if (token) inicializarLogout();
  else inicializarRegistro();

  const toggleLink = document.getElementById('toggle-usuarios');
  const panel     = document.getElementById('gestion-usuarios');
  const objetos   = document.querySelector('.objetos');

  if (toggleLink && panel) {
    toggleLink.addEventListener('click', async e => {
      e.preventDefault();
      const show = panel.style.display === 'none' || !panel.style.display;
      panel.style.display   = show ? 'block' : 'none';
      if (objetos) objetos.style.display = show ? 'none' : 'flex';
      if (show) await window.renderizarGestionUsuarios();
    });
  }
}

window.crearPersonaje          = () => mostrarFormularioCrear('personajes');
window.crearEntidad            = () => mostrarFormularioCrear('entidades');
window.crearProducto           = () => mostrarFormularioCrear('productos');
window.mostrarFormularioEditar = mostrarFormularioEditar;
window.cerrarFormulario        = cerrarFormulario;
window.handleDelete            = handleDelete;

window.addEventListener('hashchange', () => renderizarContenido(datosGlobales));
window.addEventListener('DOMContentLoaded', inicializarApp);
