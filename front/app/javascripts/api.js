// Se define la conexión a la API REST
const API_BASE = "http://127.0.0.1:8000/api/v1";

async function apiRequest(path, method = "GET", data = null, token = null) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const config = { method, headers };
  if (data) config.body = JSON.stringify(data);

  const res = await fetch(`${API_BASE}${path}`, config);
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`API Error ${res.status}: ${errText}`);
  }
  return res.status === 204 ? null : res.json();
}

// --- Autenticación ---
export async function loginAPI(username, password) {
  const payload = { username, password };
  const data = await apiRequest("/access_token", "POST", payload);
  return data.token;
}

// --- Endpoints Usuarios ---
export const getUsers = () => apiRequest("/users");
export const createUser = (obj) => apiRequest("/users", "POST", obj);
export const updateUser = (id, obj) => apiRequest(`/users/${id}`, "PUT", obj);
export const deleteUser = (id) => apiRequest(`/users/${id}`, "DELETE");

// --- Endpoints Personajes ---
export const getPersonajes = () => apiRequest("/personajes");
export const createPersonaje = (obj) => apiRequest("/personajes", "POST", obj);
export const updatePersonaje = (id, obj) => apiRequest(`/personajes/${id}`, "PUT", obj);
export const deletePersonaje = (id) => apiRequest(`/personajes/${id}`, "DELETE");

// --- Endpoints Entidades ---
export const getEntidades = () => apiRequest("/entidades");
export const createEntidad = (obj) => apiRequest("/entidades", "POST", obj);
export const updateEntidad = (id, obj) => apiRequest(`/entidades/${id}`, "PUT", obj);
export const deleteEntidad = (id) => apiRequest(`/entidades/${id}`, "DELETE");

// --- Endpoints Productos ---
export const getProductos = () => apiRequest("/productos");
export const createProducto = (obj) => apiRequest("/productos", "POST", obj);
export const updateProducto = (id, obj) => apiRequest(`/productos/${id}`, "PUT", obj);
export const deleteProducto = (id) => apiRequest(`/productos/${id}`, "DELETE");
