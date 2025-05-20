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
  deleteAssociation
} from './api.js';
import { cargarDatos, datosGlobales } from './data.js';
import { renderizarContenido } from './render.js';

function parseList(str) {
  return str
    ? str.split(',')
        .map(s => Number(s.trim()))
        .filter(n => !isNaN(n))
    : [];
}

export async function actualizarElemento(tipo, id, data) {
  const base = {
    name: data.nombre,
    birthDate: data.nacimiento,
    deathDate: data.muerte || null,
    imageUrl: data.imagen || '',
    wikiUrl: data.wiki || ''
  };
  const datos = { ...base };

  if (tipo === 'entidades') {
    datos.persons = parseList(data.personas);
  }
  if (tipo === 'productos' || tipo === 'asociaciones') {
    datos.entities = parseList(data.entidades);
    datos.persons  = parseList(data.personas);
  }

  switch (tipo) {
    case 'personajes':
      await updatePerson(id, datos);
      break;
    case 'entidades':
      await updateEntity(id, datos);
      break;
    case 'productos':
      await updateProduct(id, datos);
      break;
    case 'asociaciones':
      await updateAssociation(id, datos);
      break;
  }
}

export async function crearElemento(tipo, data) {
  const base = {
    name: data.nombre,
    birthDate: data.nacimiento,
    deathDate: data.muerte || null,
    imageUrl: data.imagen || '',
    wikiUrl: data.wiki || ''
  };
  const datos = { ...base };

  if (tipo === 'entidades') {
    datos.persons = parseList(data.personas);
  }
  if (tipo === 'productos' || tipo === 'asociaciones') {
    datos.entities = parseList(data.entidades);
    datos.persons  = parseList(data.personas);
  }

  switch (tipo) {
    case 'personajes':
      await createPerson(datos);
      break;
    case 'entidades':
      await createEntity(datos);
      break;
    case 'productos':
      await createProduct(datos);
      break;
    case 'asociaciones':
      await createAssociation(datos);
      break;
  }
}

export async function handleDelete(tipo, id) {
  if (!confirm('¿Seguro que deseas eliminar este elemento?')) return;

  switch (tipo) {
    case 'personajes':
      await deletePerson(id);
      break;
    case 'entidades':
      await deleteEntity(id);
      break;
    case 'productos':
      await deleteProduct(id);
      break;
    case 'asociaciones':
      await deleteAssociation(id);
      break;
  }

  await cargarDatos();
  renderizarContenido(datosGlobales);
}
