import {createUser, getUserByName} from "./api.js";

function inicializarRegistro() {
  const formulario = document.getElementById("form-login");
  if (!formulario) return;

  formulario.addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = formulario["user-name"].value;
    const password = formulario["pwd"].value;

    try {
      // Comprobar si el usuario existe (204 esperado si existe)
      await getUserByName(username);
      alert("Usuario existe. Procediendo con el login...");
      // Aquí puedes continuar con el login real
    } catch (err) {
      if (err.message.includes("404")) {
        // Usuario no existe → mostrar formulario adicional
        mostrarFormularioEmail(username, password);
      } else {
        alert("Error al verificar usuario: " + err.message);
      }
    }
  });

}



function mostrarFormularioEmail(username, password) {
  const formContainer = document.getElementById("form-login");
  formContainer.innerHTML = `
    <h2>Registro de nuevo usuario</h2>
    <label for="user-name">Usuario</label>
    <input type="text" id="user-name" name="user-name" value="${username}" required>
    <label for="pwd">Contraseña</label>
    <input type="password" id="pwd" name="pwd" value="${password}" required>
    <label for="email">Email</label>
    <input type="email" id="email" name="email" required>
    <button type="submit">Registrarse</button>
  `;

  formContainer.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = formContainer["email"].value;
    const nuevoUsuario = {
      username: formContainer["user-name"].value,
      password: formContainer["pwd"].value,
      email: email,
    };

    try {
      const user = await createUser(nuevoUsuario);
      alert(`Usuario creado: ${user.username} (ID ${user.id})`);
    } catch (err) {
      alert("Error creando usuario: " + err.message);
    }
  });
}




function inicializarApp() {
  if (document.getElementById("form-login")) {
    inicializarRegistro();
  } else {
    inicializarLogout();
    renderizarContenido();
  }
}

window.addEventListener("DOMContentLoaded", inicializarApp);



// CARGAR SECCIÓN

function renderizarSeccion(idSeccion, elementos, modo) {
  const contenedor = document.getElementById(idSeccion);
  contenedor.innerHTML = "";
  
  const grupos = [];
  for (let i = 0; i < elementos.length; i += 3) {
    grupos.push(elementos.slice(i, i + 3));
  }
  
  grupos.forEach((grupo, grupoIndex) => {
    const grupoDiv = document.createElement("div");
    grupoDiv.className = "grupo-tarjetas";
    
    grupo.forEach((elemento, index) => {
      const tarjeta = document.createElement("div");
      tarjeta.classList.add("card");
      
      let html = `
        <h3>${elemento.nombre}</h3>
        <img src="${elemento.imagen}" alt="${elemento.nombre}">
      `;
      
      if (modo === "reader" || modo === "writer") {
        if (idSeccion === "personajes") {
          html += `
            <p><strong>Nacimiento:</strong> ${elemento.nacimiento}</p>
            <p><strong>Muerte:</strong> ${elemento.muerte}</p>
            <a href="${elemento.wiki}" target="_blank">Saber más</a>
          `;
        } else if (idSeccion === "entidades") {
          html += `
            <p><strong>Fundación:</strong> ${elemento.nacimiento}</p>
            <p><strong>Disolución:</strong> ${elemento.muerte}</p>
            <p><strong>Participantes:</strong> ${elemento.personas.join(", ")}</p>
            <a href="${elemento.wiki}" target="_blank">Saber más</a>
          `;
        } else if (idSeccion === "productos") {
          html += `
            <p><strong>Creación:</strong> ${elemento.nacimiento}</p>
            <p><strong>Estado:</strong> ${elemento.muerte}</p>
            <p><strong>Entidades:</strong> ${elemento.entidades.join(", ")}</p>
            <p><strong>Personas:</strong> ${elemento.personas.join(", ")}</p>
            <a href="${elemento.wiki}" target="_blank">Saber más</a>
          `;
        }
        
        if (modo === "writer") {
          html += `
            <br>
            <button class="boton-eliminar" onclick="eliminarElemento('${idSeccion}', ${grupoIndex * 3 + index})">Eliminar</button>
            <button class="boton-editar" onclick="mostrarFormularioEditar('${idSeccion}', ${grupoIndex * 3 + index})">Editar</button>
          `;
        }
      }
      
      tarjeta.innerHTML = html;
      grupoDiv.appendChild(tarjeta);
    });
    
    contenedor.appendChild(grupoDiv);
  });
}

// CRUD (personajes, entidades, productos)

function eliminarElemento(seccion, indice) {
  if (confirm("¿Seguro que deseas eliminar este elemento?")) {
    datosPorUsuario.x[seccion].splice(indice, 1);
    guardarDatos();
    renderizarSeccion(seccion, datosPorUsuario.x[seccion], "writer");
  }
}

function mostrarFormularioCrear(tipo) {
  mostrarFormulario(tipo, null);
}

function mostrarFormularioEditar(seccion, indice) {
  let tipo = seccion.slice(0, -1);
  mostrarFormulario(tipo, indice);
}

function mostrarFormulario(tipo, indice) {
  let contenedorForm = document.getElementById("contenedor-formulario");
  if (!contenedorForm) {
    contenedorForm = document.createElement("div");
    contenedorForm.id = "contenedor-formulario";
    contenedorForm.classList.add("modal-formulario");
    document.body.appendChild(contenedorForm);
  }
  
  contenedorForm.innerHTML = "";
  const item = indice !== null ? datosPorUsuario.x[tipo + "s"][indice] : {};
  
  let nacimientoLabel = "Nacimiento";
  let muerteLabel = "Muerte";
  
  if (tipo === "entidad") {
    nacimientoLabel = "Fundación";
    muerteLabel = "Disolución";
  } else if (tipo === "producto") {
    nacimientoLabel = "Creación";
    muerteLabel = "Estado";
  }

  let formHtml = `
    <h3>${indice !== null ? "Editar" : "Crear"} ${tipo.charAt(0).toUpperCase() + tipo.slice(1)}</h3>
    <form id="form-${tipo}">
      <label>Nombre:</label><br>
      <input type="text" id="nuevo-nombre" value="${item.nombre || ""}" required><br>
      <label>${nacimientoLabel}:</label><br>
      <input type="text" id="nuevo-nacimiento" value="${item.nacimiento || ""}" required><br>
      <label>${muerteLabel}:</label><br>
      <input type="text" id="nuevo-muerte" value="${item.muerte || ""}" required><br>
      <label>URL Imagen:</label><br>
      <input type="text" id="nuevo-imagen" value="${item.imagen || ""}" required><br>
      <label>URL Wiki:</label><br>
      <input type="text" id="nuevo-wiki" value="${item.wiki || ""}" required><br>
  `;

  if (tipo !== "personaje") {
    if (tipo === "entidad") {
      formHtml += `
        <label>Participantes (separados por comas):</label><br>
        <input type="text" id="nuevo-participantes" value="${item.personas ? item.personas.join(", ") : ""}"><br>
      `;
    } else if (tipo === "producto") {
      formHtml += `
        <label>Entidades (separadas por comas):</label><br>
        <input type="text" id="nuevo-entidades" value="${item.entidades ? item.entidades.join(", ") : ""}"><br>
        <label>Personas (separadas por comas):</label><br>
        <input type="text" id="nuevo-personas" value="${item.personas ? item.personas.join(", ") : ""}"><br>
      `;
    }
  }
  
  formHtml += `
    <br>
    <button type="submit">${indice !== null ? "Guardar" : "Crear"}</button>
    <button type="button" onclick="cerrarFormulario()">Cancelar</button>
    </form>
  `;
  
  contenedorForm.innerHTML = formHtml;
  
  document.getElementById(`form-${tipo}`).addEventListener("submit", function(e) {
    e.preventDefault();
    const objeto = {
      nombre: document.getElementById("nuevo-nombre").value,
      nacimiento: document.getElementById("nuevo-nacimiento").value,
      muerte: document.getElementById("nuevo-muerte").value,
      imagen: document.getElementById("nuevo-imagen").value,
      wiki: document.getElementById("nuevo-wiki").value
    };
    
    if (tipo === "entidad") {
      objeto.personas = document.getElementById("nuevo-participantes").value.split(",").map(s => s.trim());
    }
    if (tipo === "producto") {
      objeto.entidades = document.getElementById("nuevo-entidades").value.split(",").map(s => s.trim());
      objeto.personas = document.getElementById("nuevo-personas").value.split(",").map(s => s.trim());
    }
    
    if (indice !== null) {
      datosPorUsuario.x[tipo + "s"][indice] = objeto;
    } else {
      datosPorUsuario.x[tipo + "s"].push(objeto);
    }
    
    guardarDatos();
    renderizarSeccion(tipo + "s", datosPorUsuario.x[tipo + "s"], "writer");
    cerrarFormulario();
  });
}

function cerrarFormulario() {
  const contenedorForm = document.getElementById("contenedor-formulario");
  if (contenedorForm) {
    contenedorForm.remove();
  }
}

function renderizarContenido() {
  const rutaActual = obtenerRutaActual();
  const datos = datosPorUsuario.x;
  
  if (rutaActual.includes("index.html")) {
    renderizarSeccion("personajes", datos.personajes, "index");
    renderizarSeccion("entidades", datos.entidades, "index");
    renderizarSeccion("productos", datos.productos, "index");
  } else if (rutaActual.includes("reader.html")) {
    renderizarSeccion("personajes", datos.personajes, "reader");
    renderizarSeccion("entidades", datos.entidades, "reader");
    renderizarSeccion("productos", datos.productos, "reader");
  } else if (rutaActual.includes("writer.html")) {
    renderizarSeccion("personajes", datos.personajes, "writer");
    renderizarSeccion("entidades", datos.entidades, "writer");
    renderizarSeccion("productos", datos.productos, "writer");
  }
}


window.addEventListener("DOMContentLoaded", inicializarApp);

function crearPersonaje() {
  mostrarFormularioCrear("personaje");
}

function crearEntidad() {
  mostrarFormularioCrear("entidad");
}

function crearProducto() {
  mostrarFormularioCrear("producto");
}