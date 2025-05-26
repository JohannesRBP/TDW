const API_BASE = "http://127.0.0.1:8000/api/v1";
const RUTA_LOGIN = "http://127.0.0.1:8000/access_token";
const JSON_HEADERS = { 'Content-Type': 'application/json' };

/**
 * Petición genérica a la API REST.
 * @param {string} path - Ruta de la API (p.ej. '/users').
 * @param {string} method - Método HTTP ('GET','POST','PUT','DELETE').
 * @param {object|null} data - Payload JSON.
 * @param {object} extraHeaders - Cabeceras adicionales.
 * @param {object} opts - Opciones { raw: boolean }.
 * @returns {Promise<any|null|{body:any,headers:Headers}>}
 */
async function apiRequest(path, method = 'GET', data = null, extraHeaders = {}, opts = {}) {
  const token = sessionStorage.getItem('access_token');

  // Construir cabeceras combinando JSON_HEADERS y extraHeaders sin spread
  const headers = {};
  // Copiar JSON_HEADERS
  for (const headerName in JSON_HEADERS) {
    if (Object.prototype.hasOwnProperty.call(JSON_HEADERS, headerName)) {
      headers[headerName] = JSON_HEADERS[headerName];
    }
  }
  // Copiar extraHeaders
  for (const headerName in extraHeaders) {
    if (Object.prototype.hasOwnProperty.call(extraHeaders, headerName)) {
      headers[headerName] = extraHeaders[headerName];
    }
  }
  // Añadir token
  if (token) {
    headers['Authorization'] = 'Bearer ' + token;
  }

  const config = { method: method, headers: headers };
  if (data) {
    config.body = JSON.stringify(data);
  }

  const res = await fetch(API_BASE + path, config);
  if (!res.ok) {
    const errText = await res.text();
    throw new Error('API Error ' + res.status + ': ' + errText);
  }

  if (opts.raw) {
    const body = res.status === 204 ? null : await res.json();
    return { body: body, headers: res.headers };
  }

  if (res.status === 204) {
    return null;
  }
  return res.json();
}

/**
 * Autenticación: obtiene el JWT.
 */
export async function loginAPI(username, password) {
  const payload = { username: username, password: password };
  const res = await fetch(RUTA_LOGIN, {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error('Login Error ' + res.status + ': ' + errText);
  }
  return res.json();
}

// Gestión de usuarios
export const getUsers      = () => apiRequest('/users');
export const createUser    = function(obj) { return apiRequest('/users', 'POST', obj); };
export const updateUser    = function(id, obj, etag) {
  const headers = etag ? { 'If-Match': etag } : {};
  return apiRequest('/users/' + id, 'PUT', obj, headers);
};
export const deleteUser    = function(id) { return apiRequest('/users/' + id, 'DELETE'); };
export const getUserByName = function(username) {
  return apiRequest('/users/username/' + encodeURIComponent(username));
};
export const getUserById   = function(id) {
  return apiRequest('/users/' + id, 'GET', null, {}, { raw: true });
};

// Gestión de entidades de dominio
export const getPersons        = () => apiRequest('/persons');
export const createPerson     = function(obj) { return apiRequest('/persons', 'POST', obj); };
export const updatePerson     = function(id, obj) { return apiRequest('/persons/' + id, 'PUT', obj); };
export const deletePerson     = function(id) { return apiRequest('/persons/' + id, 'DELETE'); };
export const getPersonByName  = function(name) {
  return apiRequest('/persons/personname/' + encodeURIComponent(name));
};

export const getEntities       = () => apiRequest('/entities');
export const createEntity      = function(obj) { return apiRequest('/entities', 'POST', obj); };
export const updateEntity      = function(id, obj) { return apiRequest('/entities/' + id, 'PUT', obj); };
export const deleteEntity      = function(id) { return apiRequest('/entities/' + id, 'DELETE'); };
// export const getEntityByName = function(name) { return apiRequest('/entities/entityname/' + encodeURIComponent(name)); };

export const getProducts       = () => apiRequest('/products');
export const createProduct     = function(obj) { return apiRequest('/products', 'POST', obj); };
export const updateProduct     = function(id, obj) { return apiRequest('/products/' + id, 'PUT', obj); };
export const deleteProduct     = function(id) { return apiRequest('/products/' + id, 'DELETE'); };
// export const getProductByName = function(name) { return apiRequest('/products/productname/' + encodeURIComponent(name)); };

export const getAssociations       = () => apiRequest('/associations');
export const createAssociation     = function(obj) { return apiRequest('/associations', 'POST', obj); };
export const updateAssociation     = function(id, obj) { return apiRequest('/associations/' + id, 'PUT', obj); };
export const deleteAssociation     = function(id) { return apiRequest('/associations/' + id, 'DELETE'); };
// export const getAssociationByName = function(name) { return apiRequest('/associations/asociationname/' + encodeURIComponent(name)); };

// Relaciones bidireccionales
export const relacion = {
  products: function(id, tipo, oper, elemId) {
    return apiRequest('/products/' + id + '/' + tipo + '/' + oper + '/' + elemId, oper);
  },
  persons: function(id, tipo, oper, elemId) {
    return apiRequest('/persons/' + id + '/' + tipo + '/' + oper + '/' + elemId, oper);
  },
  entities: function(id, tipo, oper, elemId) {
    return apiRequest('/entities/' + id + '/' + tipo + '/' + oper + '/' + elemId, oper);
  },
  associations: function(id, tipo, oper, elemId) {
    return apiRequest('/associations/' + id + '/' + tipo + '/' + oper + '/' + elemId, oper);
  }
};

/** Cierra sesión */
export function logout() {
  sessionStorage.removeItem('access_token');
  window.location.href = 'index.html';
}
