import { getPersons, getEntities, getProducts, getAssociations, relacion } from './api.js';
import { cargarDatos, datosGlobales } from './data.js';
import { renderizarContenido } from './render.js';
import { actualizarElemento, crearElemento } from './crud.js';

async function cargarOpciones() {
  return datosGlobales;
}

export async function mostrarFormularioEditar(seccion, id) {
  const opts = await cargarOpciones();
  const elem = await fetchElemento(seccion, id);
  mostrarFormulario(seccion, elem, opts);
}

export function mostrarFormularioCrear(seccion) {
  mostrarFormulario(seccion, null, datosGlobales);
}

function mostrarFormulario(seccion, existente, opts) {
  const container = document.createElement('div');
  container.className = 'modal-formulario';
  const editar = Boolean(existente);
  const cab = editar ? 'Editar' : 'Crear';

  container.innerHTML = `
    <h3>${cab} ${seccion.slice(0,-1)}</h3>
    <form id="form-${seccion}">
      <label>Nombre:</label>
      <input type="text" name="nombre" value="${existente?.name||''}" required>
      <label>Fecha:</label>
      <input type="date" name="nacimiento" value="${existente?.birthDate||''}" required>
      <label>Estado/Muerte:</label>
      <input type="date" name="muerte" value="${existente?.deathDate||''}">
      <label>Imagen (URL):</label>
      <input type="url" name="imagen" value="${existente?.imageUrl||''}">
      <label>Wiki (URL):</label>
      <input type="url" name="wiki" value="${existente?.wikiUrl||''}">
      <label>Personas (nombres separados por comas):</label>
      <input type="text" name="personas" value="${editar? existente.personas.map(id=> opts.persons.find(p=>p.id===id)?.nombre).join(', '): ''}" placeholder="Ej: Einstein, Curie">
      <label>Entidades (nombres separados por comas):</label>
      <input type="text" name="entidades" value="${editar? existente.entities.map(id=> opts.entities.find(e=>e.id===id)?.nombre).join(', '): ''}" placeholder="Ej: NASA, CERN">
      ${seccion==='productos'?`<label>Asociaciones (nombres separados por comas):</label>
      <input type="text" name="asociaciones" value="${editar? existente.associations.map(id=> opts.asociaciones.find(a=>a.id===id)?.nombre).join(', '): ''}" placeholder="Ej: IEEE">`: ''}
      <button type="submit">${editar?'Guardar':'Crear'}</button>
      <button type="button" onclick="cerrarFormulario()">Cancelar</button>
    </form>
  `;

  document.body.appendChild(container);
  document.getElementById(`form-${seccion}`).addEventListener('submit', async e => {
    e.preventDefault();
    const form = e.target;
    const nombresToIds = (text, lista) => text
      .split(',')
      .map(s=> s.trim())
      .filter(Boolean)
      .map(name => {
        const found = lista.find(x => x.nombre.toLowerCase() === name.toLowerCase());
        if (!found) throw new Error(`No existe ${name} en ${lista === datosGlobales.persons? 'personas' : 'entidades'}`);
        return found.id;
      });

    const datos = {
      nombre: form.nombre.value,
      nacimiento: form.nacimiento.value,
      muerte: form.muerte.value,
      imagen:  form.imagen.value,
      wiki:    form.wiki.value,
      personas: nombresToIds(form.personas.value, datosGlobales.persons),
      entidades: nombresToIds(form.entidades.value, datosGlobales.entities),
      asociaciones: seccion==='productos'
        ? nombresToIds(form.asociaciones.value, datosGlobales.asociaciones)
        : undefined
    };

    try {
      if (editar) {
        await actualizarElemento(seccion, existente.id, datos);
      } else {
        await crearElemento(seccion, datos);
      }
      await cargarDatos();
      renderizarContenido(datosGlobales);
      cerrarFormulario();
    } catch(err) {
      alert('Error: ' + err.message);
    }
  });
}

async function fetchElemento(seccion, id) {
  switch(seccion) {
    case 'personajes': return (await getPersons()).persons.find(p=>p.person.id===id).person;
    case 'entidades': return (await getEntities()).entities.find(e=>e.entity.id===id).entity;
    case 'productos': return (await getProducts()).products.find(p=>p.product.id===id).product;
    case 'asociaciones': return (await getAssociations()).associations.find(a=>a.association.id===id).association;
  }
}

export function cerrarFormulario() {
  document.querySelector('.modal-formulario')?.remove();
}
