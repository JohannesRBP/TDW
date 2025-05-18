import { obtenerRutaActual } from './utils.js';
import { renderizarPerfilUsuario } from './profile.js';
import { renderizarGestionUsuarios } from './userManagement.js';

export function renderizarContenido(datosGlobales) {
  const rutaActual = obtenerRutaActual();
  let modo = 'index';
  if (rutaActual.includes('reader.html')) modo = 'reader';
  if (rutaActual.includes('writer.html')) modo = 'writer';

  // Gestión de Usuarios (si existe en la página)
  const seccionUsuarios = document.getElementById('gestion-usuarios');
  if (seccionUsuarios) {
    if (modo === 'writer' && window.location.hash === '#gestion-usuarios') {
      seccionUsuarios.style.display = 'block';
      renderizarGestionUsuarios();
    } else {
      seccionUsuarios.style.display = 'none';
    }
  }

  // Renderizado de tarjetas
  renderizarSeccion('personajes', datosGlobales.persons, modo);
  renderizarSeccion('entidades', datosGlobales.entities, modo);
  renderizarSeccion('productos', datosGlobales.products, modo);

  // Perfil reader (si existe)
  const perfilPanel = document.getElementById('formulario-perfil');
  if (perfilPanel && modo === 'reader' && window.location.hash === '#mi-perfil') {
    renderizarPerfilUsuario();
  }
}

export function renderizarSeccion(idSeccion, elementos, modo) {
  const contenedor = document.getElementById(idSeccion);
  if (!contenedor) return;  // salir si no existe
  contenedor.innerHTML = '';

  const grupos = [];
  for (let i = 0; i < elementos.length; i += 3) {
    grupos.push(elementos.slice(i, i + 3));
  }
  grupos.forEach(grupo => {
    const grupoDiv = document.createElement('div');
    grupoDiv.className = 'grupo-tarjetas';
    grupo.forEach(elem => {
      const tarjeta = document.createElement('div');
      tarjeta.classList.add('card');
      let html = `
        <h3>${elem.nombre}</h3>
        <img src="${elem.imagen}" alt="${elem.nombre}">
      `;
      if (modo === 'reader' || modo === 'writer') {
        if (idSeccion === 'personajes') {
          html += `
            <p><strong>Nacimiento:</strong> ${elem.nacimiento}</p>
            <p><strong>Muerte:</strong> ${elem.muerte || 'N/A'}</p>
            <a href="${elem.wiki}" target="_blank">Saber más</a>
          `;
        } else if (idSeccion === 'entidades') {
          html += `
            <p><strong>Fundación:</strong> ${elem.nacimiento}</p>
            <p><strong>Disolución:</strong> ${elem.muerte || 'Activa'}</p>
            <p><strong>Participantes:</strong> ${elem.personas?.join(', ') || 'Ninguno'}</p>
            <a href="${elem.wiki}" target="_blank">Saber más</a>
          `;
        } else if (idSeccion === 'productos') {
          html += `
            <p><strong>Creación:</strong> ${elem.nacimiento}</p>
            <p><strong>Estado:</strong> ${elem.muerte || 'Activo'}</p>
            <p><strong>Entidades:</strong> ${elem.entidades?.join(', ') || 'Ninguna'}</p>
            <p><strong>Personas:</strong> ${elem.personas?.join(', ') || 'Ninguna'}</p>
            <a href="${elem.wiki}" target="_blank">Saber más</a>
          `;
        }
        if (modo === 'writer') {
          html += `
            <div class="acciones">
              <button class="boton-eliminar" onclick="handleDelete('${idSeccion}', ${elem.id})">Eliminar</button>
              <button class="boton-editar" onclick="mostrarFormularioEditar('${idSeccion}', ${elem.id})">Editar</button>
            </div>
          `;
        }
      }
      tarjeta.innerHTML = html;
      grupoDiv.appendChild(tarjeta);
    });
    contenedor.appendChild(grupoDiv);
  });
}
