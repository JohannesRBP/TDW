import './api.js';
import { inicializarRegistro, inicializarLogout } from './auth.js';
import { renderizarContenido }    from './render.js';
import './userManagement.js';
import {
  mostrarFormularioCrear,
  mostrarFormularioEditar,
  cerrarFormulario
} from './forms.js';
import { handleDelete }            from './crud.js';
import { cargarDatos, datosGlobales } from './data.js';
import { renderizarPerfilUsuario } from './profile.js';
import { mostrarRelaciones, cerrarFormulario as cerrarRelaciones } from './relations.js';

async function inicializarApp() {
  await cargarDatos();
  configurarAuth();
  exponerFuncionesGlobales();
  manejarRutas();
  window.addEventListener('hashchange', manejarRutas);
}

function configurarAuth() {
  const token = sessionStorage.getItem('access_token');
  token ? inicializarLogout() : inicializarRegistro();
}

function exponerFuncionesGlobales() {
  window.crearPersonaje  = () => mostrarFormularioCrear('personajes');
  window.crearEntidad    = () => mostrarFormularioCrear('entidades');
  window.crearProducto   = () => mostrarFormularioCrear('productos');
  window.crearAsociacion = () => mostrarFormularioCrear('asociaciones');

  window.mostrarFormularioEditar = mostrarFormularioEditar;
  window.cerrarFormulario        = cerrarFormulario;
  window.handleDelete            = handleDelete;
  window.mostrarRelaciones       = mostrarRelaciones;
  window.cerrarRelaciones        = cerrarRelaciones;
}

function manejarRutas() {
  const hash = window.location.hash;
  const perfil = document.getElementById('mi-perfil');
  const gest   = document.getElementById('gestion-usuarios');
  const objs   = document.querySelector('.objetos');

  if (hash === '#mi-perfil' && perfil) {
    perfil.style.display = 'block';
    objs && (objs.style.display = 'none');
    renderizarPerfilUsuario();
    return;
  }
  if (hash === '#gestion-usuarios' && gest) {
    gest.style.display = 'block';
    objs && (objs.style.display = 'none');
    window.renderizarGestionUsuarios();
    return;
  }
  perfil && (perfil.style.display = 'none');
  gest   && (gest.style.display = 'none');
  objs   && (objs.style.display = 'flex');
  renderizarContenido(datosGlobales);
}

document.addEventListener('DOMContentLoaded', inicializarApp);
