import { getPersons, getEntities, getProducts } from './api.js';
import { mapPersonsApi, mapEntitiesApi, mapProductsApi } from './mapping.js';
import { cargarDatos } from './data.js';
import { renderizarContenido } from './render.js';
import { actualizarElemento, crearElemento } from './crud.js';

export function mostrarFormularioCrear(tipo) {
  mostrarFormulario(tipo, null);
}

export async function mostrarFormularioEditar(seccion, id) {
  let elem;
  switch (seccion) {
    case 'personajes': elem = (await getPersons()).persons.find(p => p.person.id === id).person; break;
    case 'entidades': elem = (await getEntities()).entities.find(e => e.entity.id === id).entity; break;
    case 'productos': elem = (await getProducts()).products.find(p => p.product.id === id).product; break;
  }
  mostrarFormulario(seccion, elem);
}

function mostrarFormulario(tipo, elemExistente) {
  const container = document.createElement('div');
  container.id = 'contenedor-formulario';
  container.className = 'modal-formulario';
  const esEdicion = Boolean(elemExistente);
  let labels = { nacimiento: 'Nacimiento', muerte: 'Muerte' };
  if (tipo === 'entidades') labels = { nacimiento: 'Fundación', muerte: 'Disolución' };
  if (tipo === 'productos') labels = { nacimiento: 'Creación', muerte: 'Estado' };
  let html = `
    <h3>${esEdicion ? 'Editar' : 'Crear'} ${tipo.slice(0, -1)}</h3>
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
  if (tipo === 'entidades') html += `<label>Personas (IDs separados por comas):</label><input type="text" id="personas" value="${elemExistente?.persons?.join(', ') || ''}">`;
  if (tipo === 'productos') html += `
      <label>Entidades (IDs separados por comas):</label><input type="text" id="entidades" value="${elemExistente?.entities?.join(', ') || ''}">
      <label>Personas (IDs separados por comas):</label><input type="text" id="personas" value="${elemExistente?.persons?.join(', ') || ''}">
  `;
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
      nombre: document.getElementById('nombre').value,
      nacimiento: document.getElementById('nacimiento').value,
      muerte: document.getElementById('muerte').value,
      imagen: document.getElementById('imagen').value,
      wiki: document.getElementById('wiki').value,
      personas: document.getElementById('personas')?.value,
      entidades: document.getElementById('entidades')?.value
    };
    try {
      if (esEdicion) await actualizarElemento(tipo, elemExistente.id, data);
      else await crearElemento(tipo, data);
      await cargarDatos();
      renderizarContenido();
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
