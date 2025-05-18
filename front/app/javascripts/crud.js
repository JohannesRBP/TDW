import {
  createPerson,
  createEntity,
  createProduct,
  updatePerson,
  updateEntity,
  updateProduct,
  deletePerson,
  deleteEntity,
  deleteProduct
} from './api.js';
import { cargarDatos } from './data.js';
import { renderizarContenido } from './render.js';

function parseList(str) {
  return str ? str.split(',').map(Number).filter(n => !isNaN(n)) : [];
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
  if (tipo === 'entidades') datos.persons = parseList(data.personas);
  if (tipo === 'productos') {
    datos.persons = parseList(data.personas);
    datos.entities = parseList(data.entidades);
  }
  if (tipo === 'personajes') await updatePerson(id, datos);
  if (tipo === 'entidades') await updateEntity(id, datos);
  if (tipo === 'productos') await updateProduct(id, datos);
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
  if (tipo === 'entidades') datos.persons = parseList(data.personas);
  if (tipo === 'productos') {
    datos.persons = parseList(data.personas);
    datos.entities = parseList(data.entidades);
  }
  if (tipo === 'personajes') await createPerson(datos);
  if (tipo === 'entidades') await createEntity(datos);
  if (tipo === 'productos') await createProduct(datos);
}

export async function handleDelete(tipo, id) {
  if (!confirm('¿Seguro que deseas eliminar este elemento?')) return;
  if (tipo === 'personajes') await deletePerson(id);
  if (tipo === 'entidades') await deleteEntity(id);
  if (tipo === 'productos') await deleteProduct(id);
  await cargarDatos();
  renderizarContenido();
}
