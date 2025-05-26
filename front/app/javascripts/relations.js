import { datosGlobales, cargarDatos } from './data.js';
import { renderizarContenido }        from './render.js';
import { relacion }                   from './api.js';

export function mostrarRelaciones(tipo, id) {
  // 1) Mapear 'tipo' al método correcto de relacion
  const apiKeyMap = {
    personajes:   'persons',
    entidades:    'entities',
    productos:    'products',
    asociaciones: 'associations'
  };
  const apiKey = apiKeyMap[tipo];
  if (!apiKey) {
    console.error(`Tipo inválido para relaciones: ${tipo}`);
    return;
  }

  // 2) Definir opciones de relación según sección
  const opcionesMap = {
    personajes:   [{ value: 'entities', label: 'Entidades' }, { value: 'products', label: 'Productos' }],
    entidades:    [{ value: 'entities', label: 'Entidades' }, { value: 'persons',  label: 'Personas' }],
    productos:    [{ value: 'entities', label: 'Entidades' }, { value: 'persons',  label: 'Personas' }],
    asociaciones: [{ value: 'entities', label: 'Entidades' }]
  };
  const opciones = opcionesMap[tipo];

  // 3) Construir modal
  const modal = document.createElement('div');
  modal.className = 'modal-formulario';
  modal.innerHTML = `
    <div class="modal-content">
      <h3>Editar relaciones de ${tipo.slice(0,-1)} #${id}</h3>
      <form id="form-rel-${tipo}-${id}">
        <label>Tipo de elemento:</label>
        <select id="elementType" required>
          ${opciones.map(o => `<option value="${o.value}">${o.label}</option>`).join('')}
        </select>

        <label>Operación:</label>
        <select id="operationType" required>
          <option value="add">Añadir</option>
          <option value="rem">Eliminar</option>
        </select>

        <label>Elemento:</label>
        <select id="elementId" required></select>

        <div class="botones-formulario">
          <button type="submit">Ejecutar</button>
          <button type="button" id="btn-cancel">Cancelar</button>
        </div>
      </form>
    </div>
  `;
  document.body.appendChild(modal);

  // 4) Referencias a controles
  const form      = document.getElementById(`form-rel-${tipo}-${id}`);
  const selType   = form.querySelector('#elementType');
  const selId     = form.querySelector('#elementId');
  const btnCancel = form.querySelector('#btn-cancel');

  
  function actualizarOpciones() {
    const lista = datosGlobales[selType.value] || [];
    selId.innerHTML = lista.map(x => `<option value="${x.id}">${x.nombre}</option>`).join('');
  }
  selType.addEventListener('change', actualizarOpciones);
  actualizarOpciones();

  // 6) Cancelar cierra modal
  btnCancel.addEventListener('click', cerrarFormulario);

  // 7) Manejar submit: llama a relacion[apiKey]
  form.addEventListener('submit', async e => {
    e.preventDefault();
    try {
      await relacion[apiKey](
        id,
        selType.value,
        form.querySelector('#operationType').value,
        Number(selId.value)
      );
      await cargarDatos();
      renderizarContenido(datosGlobales);
      cerrarFormulario();
      alert('Relación actualizada correctamente');
    } catch (err) {
      alert('Error al actualizar relación: ' + err.message);
    }
  });
}

/** Cierra el modal */
export function cerrarFormulario() {
  document.querySelector('.modal-formulario')?.remove();
}
