import {
  createPerson,
  createEntity,
  createProduct,
  createAssociation,
  updatePerson,
  updateEntity,
  updateProduct,
  updateAssociation,
  deletePerson,
  deleteEntity,
  deleteProduct,
  deleteAssociation,
  getPersonById,
  getEntityById,
  getProductById,
  getAssociationById
} from './api.js';

import { cargarDatos, datosGlobales } from './data.js';
import { renderizarContenido } from './render.js';

/**
 * Actualiza un elemento según su tipo, usando ETag.
 * @param {string} tipo - 'personajes'|'entidades'|'productos'|'asociaciones'
 * @param {number} id
 * @param {object} data - Campos del formulario
 */
export async function actualizarElemento(tipo, id, data) {
  const payload = {
    name: data.nombre,
    birthDate: data.nacimiento,
    deathDate: data.muerte || null,
    imageUrl: data.imagen || '',
    wikiUrl: data.wiki || ''
  };

  if (tipo === 'asociaciones') {
    if (!data.websiteUrl) throw new Error('El campo websiteUrl es obligatorio para asociaciones');
    payload.websiteUrl = data.websiteUrl;
  }

  let etag;
  switch (tipo) {
    case 'personajes': {
      const { headers } = await getPersonById(id);
      etag = headers.get('etag');
      if (!etag) throw new Error('No se recibió ETag');
      await updatePerson(id, payload, etag);
      break;
    }
    case 'entidades': {
      const { headers } = await getEntityById(id);
      etag = headers.get('etag');
      if (!etag) throw new Error('No se recibió ETag');
      await updateEntity(id, payload, etag);
      break;
    }
    case 'productos': {
      const { headers } = await getProductById(id);
      etag = headers.get('etag');
      if (!etag) throw new Error('No se recibió ETag');
      await updateProduct(id, payload, etag);
      break;
    }
    case 'asociaciones': {
      const { headers } = await getAssociationById(id);
      etag = headers.get('etag');
      if (!etag) throw new Error('No se recibió ETag');
      await updateAssociation(id, payload, etag);
      break;
    }
  }
}

/**
 * Crea un nuevo elemento según su tipo.
 */
export async function crearElemento(tipo, data) {
  const payload = {
    name: data.nombre,
    birthDate: data.nacimiento,
    deathDate: data.muerte || null,
    imageUrl: data.imagen || '',
    wikiUrl: data.wiki || ''
  };

  if (tipo === 'asociaciones') {
    if (!data.websiteUrl) throw new Error('El campo websiteUrl es obligatorio para asociaciones');
    payload.websiteUrl = data.websiteUrl;
  }

  switch (tipo) {
    case 'personajes':   await createPerson(payload); break;
    case 'entidades':    await createEntity(payload); break;
    case 'productos':    await createProduct(payload); break;
    case 'asociaciones': await createAssociation(payload); break;
  }
}

/**
 * Elimina un elemento y recarga la vista.
 */
export async function handleDelete(tipo, id) {
  if (!confirm('¿Seguro que deseas eliminar este elemento?')) return;

  switch (tipo) {
    case 'personajes':   await deletePerson(id); break;
    case 'entidades':    await deleteEntity(id); break;
    case 'productos':    await deleteProduct(id); break;
    case 'asociaciones': await deleteAssociation(id); break;
  }

  await cargarDatos();
  renderizarContenido(datosGlobales);
}
