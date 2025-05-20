import './api.js';
import { inicializarRegistro, inicializarLogout } from './auth.js';
import { renderizarContenido } from './render.js';
import { renderizarPerfilUsuario } from './profile.js';
import './userManagement.js';
import { mostrarFormularioCrear, mostrarFormularioEditar, cerrarFormulario } from './forms.js';
import { handleDelete } from './crud.js';
import { cargarDatos, datosGlobales } from './data.js';

async function inicializarApp() {
  await cargarDatos();
  configurarAuth();
  exponerFuncionesGlobales();
  manejarRutas();                           
  window.addEventListener('hashchange', manejarRutas);
}

function configurarAuth() {
  const token = sessionStorage.getItem('access_token');
  if (token) inicializarLogout();
  else inicializarRegistro();
}

function exponerFuncionesGlobales() {
  window.crearPersonaje          = () => mostrarFormularioCrear('personajes');
  window.crearEntidad            = () => mostrarFormularioCrear('entidades');
  window.crearProducto           = () => mostrarFormularioCrear('productos');
  window.crearAsociacion         = () => mostrarFormularioCrear('asociaciones');

  window.mostrarFormularioEditar = mostrarFormularioEditar;
  window.cerrarFormulario        = cerrarFormulario;
  window.handleDelete            = handleDelete;
}

function manejarRutas() {
  const hash       = window.location.hash;
  const perfilSec  = document.getElementById('mi-perfil');
  const gestSec    = document.getElementById('gestion-usuarios');
  const objetosSec = document.querySelector('.objetos');

  // Mostrar Mi Perfil
  if (hash === '#mi-perfil' && perfilSec) {
    perfilSec.style.display  = 'block';
    if (objetosSec) objetosSec.style.display = 'none';
    renderizarPerfilUsuario();
    return;
  }

  // Mostrar Gestión de Usuarios
  if (hash === '#gestion-usuarios' && gestSec) {
    gestSec.style.display    = 'block';
    if (objetosSec) objetosSec.style.display = 'none';
    if (typeof window.renderizarGestionUsuarios === 'function') {
      window.renderizarGestionUsuarios();
    }
    return;
  }

  // Por defecto, ocultar extras y mostrar tarjetas
  if (perfilSec)  perfilSec.style.display  = 'none';
  if (gestSec)    gestSec.style.display    = 'none';
  if (objetosSec) objetosSec.style.display = 'flex';

  renderizarContenido(datosGlobales);
}

document.addEventListener('DOMContentLoaded', inicializarApp);
