import { mapPersonsApi, mapEntitiesApi, mapProductsApi } from './mapping.js';
import { getPersons, getEntities, getProducts } from './api.js';

export let datosGlobales = { persons: [], entities: [], products: [] };

export async function cargarDatos() {
  const c1 = getPersons().then(r => datosGlobales.persons = mapPersonsApi(r)).catch(e => datosGlobales.persons = []);
  const c2 = getEntities().then(r => datosGlobales.entities = mapEntitiesApi(r)).catch(e => datosGlobales.entities = []);
  const c3 = getProducts().then(r => datosGlobales.products = mapProductsApi(r)).catch(e => datosGlobales.products = []);
  await Promise.allSettled([c1, c2, c3]);
}
