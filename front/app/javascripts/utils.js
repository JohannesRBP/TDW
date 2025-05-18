export function obtenerRutaActual() {
  return window.location.pathname;
}

export function obtenerUsuarioActual() {
  return JSON.parse(sessionStorage.getItem('user'));
}
