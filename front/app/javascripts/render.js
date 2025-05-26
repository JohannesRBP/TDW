// render.js
import { obtenerRutaActual }      from './utils.js';
import { renderizarPerfilUsuario } from './profile.js';
import { renderizarGestionUsuarios } from './userManagement.js';
import { datosGlobales } from './data.js';

export function renderizarContenido(datosGlobales) {
  const rutaActual = obtenerRutaActual();
  let modo = 'index';
  if (rutaActual.includes('reader.html')) modo = 'reader';
  if (rutaActual.includes('writer.html')) modo = 'writer';

  // Gestión de usuarios
  const seccionUsuarios = document.getElementById('gestion-usuarios');
  if (seccionUsuarios) {
    if (modo === 'writer' && window.location.hash === '#gestion-usuarios') {
      seccionUsuarios.style.display = 'block';
      renderizarGestionUsuarios();
    } else {
      seccionUsuarios.style.display = 'none';
    }
  }

  // Mi perfil
  const perfilPanel = document.getElementById('mi-perfil');
  if (perfilPanel) {
    if (modo === 'reader' && window.location.hash === '#mi-perfil') {
      perfilPanel.style.display = 'block';
      renderizarPerfilUsuario();
    } else {
      perfilPanel.style.display = 'none';
    }
  }

  // Tarjetas
  renderizarSeccion('personajes',   datosGlobales.persons,      modo);
  renderizarSeccion('entidades',    datosGlobales.entities,    modo);
  renderizarSeccion('productos',    datosGlobales.products,    modo);
  renderizarSeccion('asociaciones', datosGlobales.asociaciones, modo);
}

export function renderizarSeccion(idSeccion, elementos, modo) {
  const cont = document.getElementById(idSeccion);
  if (!cont) return;
  cont.innerHTML = '';

  // Agrupar de 4 en 4
  for (let i = 0; i < elementos.length; i += 3) {
    const grupoDiv = document.createElement('div');
    grupoDiv.className = 'grupo-tarjetas';

    elementos.slice(i, i + 3).forEach(elem => {
      const tarjeta = document.createElement('div');
      tarjeta.className = 'card';

      let html = `
        <h3>${elem.nombre}</h3>
        <img src="${elem.imagen}" alt="${elem.nombre}">
      `;

      if (modo === 'reader' || modo === 'writer') {
        // Datos básicos
        switch (idSeccion) {
          case 'personajes':
            html += `<p><strong>Nacimiento:</strong> ${elem.nacimiento}</p><p><strong>Muerte:</strong> ${elem.muerte||'N/A'}</p>`;
            break;
          case 'entidades':
            html += `<p><strong>Fundación:</strong> ${elem.nacimiento}</p><p><strong>Disolución:</strong> ${elem.muerte||'Activa'}</p>`;
            break;
          case 'productos':
          case 'asociaciones':
            html += `<p><strong>Creación:</strong> ${elem.nacimiento}</p><p><strong>Estado:</strong> ${elem.muerte||'Activo'}</p>`;
            break;
        }

        // Relaciones directas (bidireccional implícita)
        if (elem.personas?.length) {
          const personas = datosGlobales.persons.filter(p=>elem.personas.includes(p.id)).map(p=>p.nombre);
          html += `<p><strong>Personas relacionadas:</strong> ${personas.join(', ')}</p>`;
        }
        if (elem.entidades?.length) {
          const entidades = datosGlobales.entities.filter(e=>elem.entidades.includes(e.id)).map(e=>e.nombre);
          html += `<p><strong>Entidades relacionadas:</strong> ${entidades.join(', ')}</p>`;
        }

        // Relaciones inversas específicas para entidades
        if (idSeccion === 'entidades') {
          const productosInv = datosGlobales.products.filter(p=>p.entidades?.includes(elem.id)).map(p=>p.nombre);
          if (productosInv.length) html += `<p><strong>Productos relacionados:</strong> ${productosInv.join(', ')}</p>`;
          const asociacionesInv = datosGlobales.asociaciones.filter(a=>a.entidades?.includes(elem.id)).map(a=>a.nombre);
          if (asociacionesInv.length) html += `<p><strong>Asociaciones relacionadas:</strong> ${asociacionesInv.join(', ')}</p>`;
        }

        html += `<a href="${elem.wiki}" target="_blank">Saber más</a>`;

        if (modo === 'writer') {
          html += `
            <div class="acciones">
              <button class="boton-eliminar" onclick="handleDelete('${idSeccion}', ${elem.id})">Eliminar</button>
              <button class="boton-editar"  onclick="mostrarFormularioEditar('${idSeccion}', ${elem.id})">Editar</button>
              <button class="boton-relaciones" onclick="mostrarRelaciones('${idSeccion}', ${elem.id})">Relaciones</button>
            </div>
          `;
        }
      }

      tarjeta.innerHTML = html;
      grupoDiv.appendChild(tarjeta);
    });

    cont.appendChild(grupoDiv);
  }
}
