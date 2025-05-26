import {
  mapPersonsApi,
  mapEntitiesApi,
  mapProductsApi,
  mapAsociationsApi
} from './mapping.js';

import {
  getPersons,
  getEntities,
  getProducts,
  getAssociations
} from './api.js';

export let datosGlobales = {
  persons: [],
  entities: [],
  products: [],
  asociaciones: []
};

export async function cargarDatos() {
  const c1 = getPersons()
    .then(r => datosGlobales.persons = mapPersonsApi(r))
    .catch(_ => datosGlobales.persons = []);
    
  const c2 = getEntities()
    .then(r => datosGlobales.entities = mapEntitiesApi(r))
    .catch(_ => datosGlobales.entities = []);
    
  const c3 = getProducts()
    .then(r => datosGlobales.products = mapProductsApi(r))
    .catch(_ => datosGlobales.products = []);
    
  const c4 = getAssociations()
    .then(r => datosGlobales.asociaciones = mapAsociationsApi(r))
    .catch(_ => datosGlobales.asociaciones = []);
    
  await Promise.allSettled([c1, c2, c3, c4]);
}
