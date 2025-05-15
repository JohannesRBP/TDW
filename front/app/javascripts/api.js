// ===========================================================
// Configuración base para la API REST
// ===========================================================
const API_BASE = "http://127.0.0.1:8000/api/v1";

// ===========================================================
// Función genérica para realizar peticiones a la API REST
// -----------------------------------------------------------
// Parámetros:
//   path   -> Ruta específica de la API (ej. "/users")
//   method -> Método HTTP ("GET", "POST", etc.) (por defecto "GET")
//   data   -> Objeto de datos a enviar (se convierte a JSON)
//   token  -> Token de autenticación (si es necesario)
// ===========================================================
async function apiRequest(path, method = "GET", data = null, token = null) {
  // Definir cabeceras: siempre se envía JSON
  const headers = { "Content-Type": "application/json" };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // Configuración de la petición
  const config = { method, headers };

  // Si se envían datos, se serializan a JSON
  if (data) {
    config.body = JSON.stringify(data);
  }

  // Realizar la petición al endpoint concatenando la ruta a API_BASE
  const res = await fetch(`${API_BASE}${path}`, config);

  // Si la respuesta no es exitosa, se lanza un error con el mensaje correspondiente
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`API Error ${res.status}: ${errText}`);
  }

  // Retorna la respuesta en JSON o null en caso de 204 No Content
  return res.status === 204 ? null : res.json();
}

// ===========================================================
// ENDPOINTS DE AUTENTICACIÓN
// -----------------------------------------------------------
// Función para el login, que recibe el usuario y la contraseña,
// envía la petición y retorna el token de autenticación.
// ===========================================================
export async function loginAPI(username, password) {
  const payload = { username, password };
  const data = await apiRequest("/access_token", "POST", payload);
  return data.token;
}

// ===========================================================
// ENDPOINTS DE GESTIÓN DE USUARIOS
// ===========================================================
export const getUsers    = () => apiRequest("/users");
export const createUser  = (obj) => apiRequest("/users", "POST", obj);
export const updateUser  = (id, obj) => apiRequest(`/users/${id}`, "PUT", obj);
export const deleteUser  = (id) => apiRequest(`/users/${id}`, "DELETE");
export const getUserByName  = (username) => apiRequest(`/users/username/${username}`);

// ===========================================================
// ENDPOINTS DE GESTIÓN DE PERSONAJES
// ===========================================================
export const getPersonajes    = () => apiRequest("/personajes");
export const createPersonaje  = (obj) => apiRequest("/personajes", "POST", obj);
export const updatePersonaje  = (id, obj) => apiRequest(`/personajes/${id}`, "PUT", obj);
export const deletePersonaje  = (id) => apiRequest(`/personajes/${id}`, "DELETE");

// ===========================================================
// ENDPOINTS DE GESTIÓN DE ENTIDADES
// ===========================================================
export const getEntidades   = () => apiRequest("/entidades");
export const createEntidad  = (obj) => apiRequest("/entidades", "POST", obj);
export const updateEntidad  = (id, obj) => apiRequest(`/entidades/${id}`, "PUT", obj);
export const deleteEntidad  = (id) => apiRequest(`/entidades/${id}`, "DELETE");

// ===========================================================
// ENDPOINTS DE GESTIÓN DE PRODUCTOS
// ===========================================================
export const getProductos   = () => apiRequest("/productos");
export const createProducto = (obj) => apiRequest("/productos", "POST", obj);
export const updateProducto = (id, obj) => apiRequest(`/productos/${id}`, "PUT", obj);
export const deleteProducto = (id) => apiRequest(`/productos/${id}`, "DELETE");
