// ================================
// app.js
// Lógica de login/registro y renderizado de contenido
// ================================
import {
  getUserByName,
  createUser,
  loginAPI,
  logout,
  getPersons,
  getEntities,
  getProducts,
  createPerson,
  createEntity,
  createProduct,
  updatePerson,
  updateEntity,
  updateProduct,
  deletePerson,
  deleteEntity,
  deleteProduct
} from './api.js';

// =====================================
// Mapea respuesta de /persons al formato de UI
// =====================================
function mapPersonsApi(resp) {
  return resp.persons.map(item => {
    const p = item.person;
    return {
      id: p.id,
      nombre: p.name,
      nacimiento: p.birthDate,
      muerte: p.deathDate,
      imagen: p.imageUrl,
      wiki: p.wikiUrl,
      personas: p.persons,
      entidades: p.entities
    };
  });
}

// =====================================
// Mapea respuesta de /entities al formato de UI
// =====================================
function mapEntitiesApi(resp) {
  return resp.entities.map(item => {
    const e = item.entity;
    return {
      id: e.id,
      nombre: e.name,
      nacimiento: e.birthDate,
      muerte: e.deathDate,
      imagen: e.imageUrl,
      wiki: e.wikiUrl,
      personas: e.persons,
      entidades: []
    };
  });
}

// =====================================
// Mapea respuesta de /products al formato de UI
// =====================================
function mapProductsApi(resp) {
  return resp.products.map(item => {
    const p = item.product;
    return {
      id: p.id,
      nombre: p.name,
      nacimiento: p.birthDate,
      muerte: p.deathDate,
      imagen: p.imageUrl,
      wiki: p.wikiUrl,
      personas: p.persons,
      entidades: p.entities
    };
  });
}

// =====================================
// Muestra el formulario extendido para registro
// =====================================
function mostrarFormularioEmail(username, password) {
  const loginSection = document.querySelector('section.form-login');
  loginSection.innerHTML = `
    <h2>Registro de nuevo usuario</h2>
    <form id="form-email">
      <label for="user-name">Usuario</label>
      <input type="text" id="user-name" name="user-name" value="${username}" readonly>
      <label for="pwd">Contraseña</label>
      <input type="password" id="pwd" name="pwd" value="${password}" readonly>
      <label for="email">Email</label>
      <input type="email" id="email" name="email" required>
      <button type="submit">Registrarse</button>
    </form>
  `;

  document.getElementById('form-email').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = e.target['email'].value.trim();
    try {
      await createUser({ username, password, email });
      alert('Registro completado. Espera a un writer para activarte.');
      window.location.reload();
    } catch (err) {
      alert('Error creando usuario: ' + err.message);
    }
  });
}

// =====================================
// Inicializa formulario de login/registro
// =====================================
function inicializarRegistro() {
  const formLogin = document.querySelector('section.form-login form#form-login');
  const usernameInput = formLogin['user-name'];
  const pwdInput = formLogin['pwd'];

  formLogin.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = usernameInput.value.trim();
    const password = pwdInput.value;

    try {
      // Primero comprobamos si el usuario existe
      await getUserByName(username);
      // Si existe, intentamos login
      try {
        const data = await loginAPI(username, password);
        sessionStorage.setItem('access_token', data.access_token);
        alert('¡Bienvenido de nuevo!');
        inicializarApp();
      } catch (loginErr) {
        if (loginErr.message.includes('401')) {
          alert('Contraseña incorrecta. Inténtalo de nuevo.');
          pwdInput.focus();
        } else {
          alert('Error en login: ' + loginErr.message);
        }
      }
    } catch (err) {
      // Si getUserByName devuelve 404, usuario no existe → registrarse
      if (err.message.includes('404')) {
        mostrarFormularioEmail(username, password);
      } else {
        alert('Error comprobando usuario: ' + err.message);
      }
    }
  });
}

// =====================================
// Inicializa la aplicación tras login usando la API
// =====================================
function inicializarApp() {
  const token = sessionStorage.getItem('access_token');
  if (!token) return;

  // Obtener datos reales desde la API y mapearlos
  Promise.all([getPersons(), getEntities(), getProducts()])
    .then(([personsResp, entitiesResp, productsResp]) => {
      const personajes = mapPersonsApi(personsResp);
      const entidades  = mapEntitiesApi(entitiesResp);
      const productos  = mapProductsApi(productsResp);

      // Guardamos en la variable global para renderizar
      window.datosPorUsuario = { x: { personajes, entidades, productos } };
      renderizarContenido();

      // Añadimos botón de logout dinámicamente
      const btnLogout = document.createElement('button');
      btnLogout.id = 'btn-logout';
      btnLogout.textContent = 'Cerrar sesión';
      document.querySelector('nav ul').appendChild(btnLogout);
      btnLogout.addEventListener('click', logout);
    })
    .catch(() => {
      // Si falla, limpiamos sesión
      logout();
    });
}

// =====================================
// Renderizado de secciones (personajes, entidades, productos)
// =====================================
function renderizarSeccion(idSeccion, elementos, modo) {
  const contenedor = document.getElementById(idSeccion);
  contenedor.innerHTML = '';

  // Agrupamos de 3 en 3 para filas
  const grupos = [];
  for (let i = 0; i < elementos.length; i += 3) {
    grupos.push(elementos.slice(i, i + 3));
  }

  grupos.forEach((grupo, grupoIndex) => {
    const grupoDiv = document.createElement('div');
    grupoDiv.className = 'grupo-tarjetas';

    grupo.forEach((el, idx) => {
      const tarjeta = document.createElement('div');
      tarjeta.classList.add('card');
      let html = `<h3>${el.nombre}</h3><img src="${el.imagen}" alt="${el.nombre}">`;

      if (modo === 'reader' || modo === 'writer') {
        if (idSeccion === 'personajes') {
          html += `
            <p><strong>Nacimiento:</strong> ${el.nacimiento}</p>
            <p><strong>Muerte:</strong> ${el.muerte}</p>
            <a href="${el.wiki}" target="_blank">Saber más</a>
          `;
        } else if (idSeccion === 'entidades') {
          html += `
            <p><strong>Fundación:</strong> ${el.nacimiento}</p>
            <p><strong>Disolución:</strong> ${el.muerte}</p>
            <p><strong>Participantes:</strong> ${el.personas.join(', ')}</p>
            <a href="${el.wiki}" target="_blank">Saber más</a>
          `;
        } else if (idSeccion === 'productos') {
          html += `
            <p><strong>Creación:</strong> ${el.nacimiento}</p>
            <p><strong>Estado:</strong> ${el.muerte}</p>
            <p><strong>Entidades:</strong> ${el.entidades.join(', ')}</p>
            <p><strong>Personas:</strong> ${el.personas.join(', ')}</p>
            <a href="${el.wiki}" target="_blank">Saber más</a>
          `;
        }
        if (modo === 'writer') {
          const pos = grupoIndex * 3 + idx;
          html += `
            <br>
            <button onclick="handleDelete('${idSeccion}', ${pos})">Eliminar</button>
            <button onclick="handleEdit('${idSeccion}', ${pos})">Editar</button>
          `;
        }
      }

      tarjeta.innerHTML = html;
      grupoDiv.appendChild(tarjeta);
    });

    contenedor.appendChild(grupoDiv);
  });
}

// =====================================
// CRUD dinámico con la API
// =====================================
async function handleDelete(seccion, indice) {
  if (!confirm('¿Seguro que deseas eliminar este elemento?')) return;
  const item = window.datosPorUsuario.x[seccion];
  const target = item[indice];
  try {
    if (seccion === 'personajes') await deletePerson(target.id);
    if (seccion === 'entidades')  await deleteEntity(target.id);
    if (seccion === 'productos')  await deleteProduct(target.id);

    window.datosPorUsuario.x[seccion].splice(indice, 1);
    renderizarSeccion(seccion, window.datosPorUsuario.x[seccion], 'writer');
  } catch (err) {
    alert('Error eliminando: ' + err.message);
  }
}

function handleEdit(seccion, indice) {
  mostrarFormulario(seccion.slice(0, -1), indice);
}

async function submitForm(tipo, indice, data) {
  try {
    let updated;
    if (indice !== null) {
      if (tipo === 'personaje') updated = await updatePerson(data.id, data);
      if (tipo === 'entidad')  updated = await updateEntity(data.id, data);
      if (tipo === 'producto') updated = await updateProduct(data.id, data);
      window.datosPorUsuario.x[tipo + 's'][indice] = updated;
    } else {
      if (tipo === 'personaje') updated = await createPerson(data);
      if (tipo === 'entidad')  updated = await createEntity(data);
      if (tipo === 'producto') updated = await createProduct(data);
      window.datosPorUsuario.x[tipo + 's'].push(updated);
    }
    renderizarSeccion(tipo + 's', window.datosPorUsuario.x[tipo + 's'], 'writer');
  } catch (err) {
    alert('Error guardando: ' + err.message);
  }
}

// =====================================
// Determina ruta actual y renderiza
// =====================================
function obtenerRutaActual() {
  return window.location.pathname.split('/').pop();
}

function renderizarContenido() {
  const ruta = obtenerRutaActual();
  const datos = window.datosPorUsuario.x;

  if (ruta === 'index.html') {
    renderizarSeccion('personajes', datos.personajes, 'index');
    renderizarSeccion('entidades', datos.entidades, 'index');
    renderizarSeccion('productos', datos.productos, 'index');
  } else if (ruta === 'reader.html') {
    renderizarSeccion('personajes', datos.personajes, 'reader');
    renderizarSeccion('entidades', datos.entidades, 'reader');
    renderizarSeccion('productos', datos.productos, 'reader');
  } else if (ruta === 'writer.html') {
    renderizarSeccion('personajes', datos.personajes, 'writer');
    renderizarSeccion('entidades', datos.entidades, 'writer');
    renderizarSeccion('productos', datos.productos, 'writer');
  }
}

// =====================================
// Arranque
// =====================================
window.addEventListener('DOMContentLoaded', () => {
  const ruta = obtenerRutaActual();

  // 1) Mostrar siempre datos públicos en index
  if (ruta === 'index.html') {
    Promise.all([getPersons(), getEntities(), getProducts()])
      .then(([pr, en, pd]) => {
        window.datosPorUsuario = {
          x: {
            personajes:  mapPersonsApi(pr),
            entidades:   mapEntitiesApi(en),
            productos:   mapProductsApi(pd)
          }
        };
        renderizarContenido();
      })
      .catch(err => console.error('Error cargando datos públicos:', err));
  }

  // 2) Autenticación
  const token = sessionStorage.getItem('access_token');
  if (token) {
    inicializarApp();
  } else {
    inicializarRegistro();
  }
});
