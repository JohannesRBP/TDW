import { getPersons, getEntities, getProducts } from './api.js';
import { cargarDatos, datosGlobales } from './data.js';
import { renderizarContenido } from './render.js';
import { actualizarElemento, crearElemento } from './crud.js';

const singularMap = {
  personajes: 'personaje',
  entidades: 'entidad',
  productos: 'producto',
  asociaciones: 'asociación'
};

export function mostrarFormularioCrear(tipo) {
  mostrarFormulario(tipo, null);
}

export async function mostrarFormularioEditar(seccion, id) {
  let elem;
  switch (seccion) {
    case 'personajes':
      elem = (await getPersons()).persons.find(p => p.person.id === id).person;
      break;
    case 'entidades':
      elem = (await getEntities()).entities.find(e => e.entity.id === id).entity;
      break;
    case 'productos':
      elem = (await getProducts()).products.find(p => p.product.id === id).product;
      break;
  }
  mostrarFormulario(seccion, elem);
}

function mostrarFormulario(tipo, elemExistente) {
  const container = document.createElement('div');
  container.id = 'contenedor-formulario';
  container.className = 'modal-formulario';
  const esEdicion = Boolean(elemExistente);
  const entidad = singularMap[tipo] || tipo.slice(0, -1);

  const labels = {
    nacimiento: tipo === 'entidades' ? 'Fundación' : tipo === 'productos' ? 'Creación' : 'Nacimiento',
    muerte: tipo === 'entidades' ? 'Disolución' : tipo === 'productos' ? 'Estado' : 'Muerte'
  };

  let html = `
    <h3>${esEdicion ? 'Editar ' : 'Crear '} ${entidad.charAt(0).toUpperCase() + entidad.slice(1)}</h3>
    <form id="form-${tipo}">
      <label>Nombre:</label>
      <input type="text" id="nombre" value="${elemExistente?.name || ''}" required>
      <label>${labels.nacimiento}:</label>
      <input type="date" id="nacimiento" value="${elemExistente?.birthDate || ''}" required>
      <label>${labels.muerte}:</label>
      <input type="date" id="muerte" value="${elemExistente?.deathDate || ''}">
      <label>URL Imagen:</label>
      <input type="url" id="imagen" value="${elemExistente?.imageUrl || ''}">
      <label>URL Wiki:</label>
      <input type="url" id="wiki" value="${elemExistente?.wikiUrl || ''}">
  `;

  if (tipo === 'asociaciones') {
    html += `
      <label>URL Sitio Web:</label>
      <input type="url" id="website" value="${elemExistente?.websiteUrl || ''}" required>
    `;
  }

  html += `
      <button type="submit">${esEdicion ? 'Guardar' : 'Crear'}</button>
      <button type="button" onclick="cerrarFormulario()">Cancelar</button>
    </form>
  `;

  container.innerHTML = html;
  document.body.appendChild(container);

  document.getElementById(`form-${tipo}`).addEventListener('submit', async e => {
    e.preventDefault();

    const data = {
      nombre: document.getElementById('nombre').value.trim(),
      nacimiento: document.getElementById('nacimiento').value,
      muerte: document.getElementById('muerte').value,
      imagen: document.getElementById('imagen').value.trim(),
      wiki: document.getElementById('wiki').value.trim()
    };

    if (tipo === 'asociaciones') {
      const site = document.getElementById('website').value.trim();
      if (!site) {
        alert('El campo URL Sitio Web es obligatorio para asociaciones.');
        return;
      }
      data.websiteUrl = site;
    }

    try {
      if (esEdicion) {
        await actualizarElemento(tipo, elemExistente.id, data);
      } else {
        await crearElemento(tipo, data);
      }
      await cargarDatos();
      renderizarContenido(datosGlobales);
      cerrarFormulario();
    } catch (err) {
      alert('Error: ' + err.message);
    }
  });
}

export function cerrarFormulario() {
  const cont = document.getElementById('contenedor-formulario');
  if (cont) cont.remove();
}
