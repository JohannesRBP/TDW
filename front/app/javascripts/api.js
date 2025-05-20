// ================================
// api.js
// Configuración de la comunicación con la API REST
// ================================

// URL base de tu API
const API_BASE = "http://127.0.0.1:8000/api/v1";
// Ruta para obtener el token de acceso
const RUTA_LOGIN = "http://127.0.0.1:8000/access_token";

/**
 * Función genérica para realizar peticiones a la API REST.
 * @param {string} path - Ruta específica de la API (ej. "/users").
 * @param {string} method - Método HTTP ("GET", "POST", etc.).
 * @param {object|null} data - Objeto de datos a enviar (se convierte a JSON).
 * @returns {Promise<any|null>} - Respuesta JSON o null si es 204 No Content.
 */
async function apiRequest(path, method = "GET", data = null, extraHeaders = {}) {
  // Recuperar token desde sessionStorage para autorización
  const token = sessionStorage.getItem("access_token");
  
  // Configurar cabeceras: JSON y Bearer token si existe
  const headers = { "Content-Type": "application/json" };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  Object.assign(headers, extraHeaders);

  // Construir configuración de la petición Fetch
  const config = { method, headers };
  if (data) {
    config.body = JSON.stringify(data);
  }

  // Ejecutar petición
  const res = await fetch(`${API_BASE}${path}`, config);

  // Si respuesta no OK, lanzar error con mensaje
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`API Error ${res.status}: ${errText}`);
  }

  // Si no hay contenido, devolver null
  return res.status === 204 ? null : res.json();
}

/**
 * Función para autenticar al usuario y obtener un JWT.
 * @param {string} username - Nombre de usuario.
 * @param {string} password - Contraseña.
 * @returns {Promise<object>} - Objeto con token_type, expires_in y access_token.
 */
export async function loginAPI(username, password) {
  const payload = { username, password };
  const response = await fetch(RUTA_LOGIN, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Login Error ${response.status}: ${errText}`);
  }

  // Devolver JSON con el token
  return response.json();
}

// ================================
// Endpoints de gestión de usuarios (NO CAMBIADOS)
// ================================
export const getUsers       = () => apiRequest("/users");
export const createUser     = (obj) => apiRequest("/users", "POST", obj);
export const updateUser     = (id, obj, etag) => apiRequest(`/users/${id}`, "PUT", obj, etag ? { "If-Match": etag } : {});
export const deleteUser     = (id) => apiRequest(`/users/${id}`, "DELETE");
export const getUserByName  = (username) => apiRequest(`/users/username/${username}`);
export async function getUserById(id) {
  // Construye tus headers como en apiRequest
  const token = sessionStorage.getItem("access_token");
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  // Llamada al fetch directamente
  const res = await fetch(`${API_BASE}/users/${id}`, {
    method: "GET",
    headers
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`API Error ${res.status}: ${txt}`);
  }

  // Parseamos el body y devolvemos headers
  const body = await res.json();
  return { body, headers: res.headers };
}

// ================================
// Endpoints de gestión de PERSONAS (antes personajes)
// ================================
export const getPersons     = () => apiRequest("/persons");
export const createPerson   = (obj) => apiRequest("/persons", "POST", obj);
export const updatePerson   = (id, obj) => apiRequest(`/persons/${id}`, "PUT", obj);
export const deletePerson   = (id) => apiRequest(`/persons/${id}`, "DELETE");
export const getPersonByName= (name) => apiRequest(`/persons/personname/${encodeURIComponent(name)}`);

// ================================
// Endpoints de gestión de ENTIDADES (CORREGIDOS)
// ================================
export const getEntities    = () => apiRequest("/entities");
export const createEntity   = (obj) => apiRequest("/entities", "POST", obj);
export const updateEntity   = (id, obj) => apiRequest(`/entities/${id}`, "PUT", obj);
export const deleteEntity   = (id) => apiRequest(`/entities/${id}`, "DELETE");
export const getEntityByName= (name) => apiRequest(`/entities/entityname/${encodeURIComponent(name)}`);

// ================================
// Endpoints de gestión de PRODUCTOS (CORREGIDOS)
// ================================
export const getProducts    = () => apiRequest("/products");
export const createProduct  = (obj) => apiRequest("/products", "POST", obj);
export const updateProduct  = (id, obj) => apiRequest(`/products/${id}`, "PUT", obj);
export const deleteProduct  = (id) => apiRequest(`/products/${id}`, "DELETE");
export const getProductByName= (name) => apiRequest(`/products/productname/${encodeURIComponent(name)}`);

// =====================================
// Endpoints de gestión de ASOCIACIONES 
// =====================================
export const getAssociations  = () => apiRequest("/associations");
export const createAssociation = (obj) => apiRequest("/associations", "POST", obj);
export const updateAssociation = (id, obj) => apiRequest(`/associations/${id}`, "PUT", obj);
export const deleteAssociation = (id) => apiRequest(`/associations/${id}`, "DELETE");
export const getAssociationByName= (name) => apiRequest(`/associations/asociationname/${encodeURIComponent(name)}`);

// =====================================
// Endpoints para todas las relaciones
// =====================================
async function relationshipRequest(path, operation = 'PUT') {
  const token = sessionStorage.getItem('access_token');
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}${path}`, { method: operation, headers });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`API Error ${res.status}: ${txt}`);
  }
  return null;
}

export const relacion = {
  products: (id, tipo, oper, elemId) =>
    relationshipRequest(`/products/${id}/${tipo}/${oper}/${elemId}`),
  persons: (id, tipo, oper, elemId) =>
    relationshipRequest(`/persons/${id}/${tipo}/${oper}/${elemId}`),
  entities: (id, tipo, oper, elemId) =>
    relationshipRequest(`/entities/${id}/${tipo}/${oper}/${elemId}`),
  associations: (id, tipo, oper, elemId) =>
    relationshipRequest(`/associations/${id}/${tipo}/${oper}/${elemId}`)
};


// ================================
// Limpieza de sesión: cierra sesión 
// ================================
export function logout() {
  // Borrar el token de sessionStorage
  sessionStorage.removeItem("access_token");
  // Recargar a la página pública (index.html)
  window.location.href = "index.html";
}