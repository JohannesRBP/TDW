import {
  getPersons,
  getEntities,
  getProducts
} from './api.js';

export function mapPersonsApi(resp) {
  return resp.persons.map(item => ({
    id: item.person.id,
    nombre: item.person.name,
    nacimiento: item.person.birthDate,
    muerte: item.person.deathDate,
    imagen: item.person.imageUrl,
    wiki: item.person.wikiUrl,
    personas: item.person.persons,
    entidades: item.person.entities
  }));
}

export function mapEntitiesApi(resp) {
  return resp.entities.map(item => ({
    id: item.entity.id,
    nombre: item.entity.name,
    nacimiento: item.entity.birthDate,
    muerte: item.entity.deathDate,
    imagen: item.entity.imageUrl,
    wiki: item.entity.wikiUrl,
    personas: item.entity.persons,
    entidades: []
  }));
}

export function mapProductsApi(resp) {
  return resp.products.map(item => ({
    id: item.product.id,
    nombre: item.product.name,
    nacimiento: item.product.birthDate,
    muerte: item.product.deathDate,
    imagen: item.product.imageUrl,
    wiki: item.product.wikiUrl,
    personas: item.product.persons,
    entidades: item.product.entities
  }));
}
