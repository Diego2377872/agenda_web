document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("actividadForm");
  const feedback = document.createElement("div");
  form.after(feedback);
  let datos = {};

  const cargarDatos = async () => {
    // Cargar datos de la API
  };

  const guardarDatos = async () => {
    // Guardar datos a la API
  };

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const fechaInicial = document.getElementById("fechaInicial").value;
    const fechaFinal = document.getElementById("fechaFinal").value;
    const actividad = document.getElementById("actividad").value;
    const permisoSandra = document.getElementById("permisoSandra").value;
    const viatico = document.getElementById("viatico").value;

    const mes = new Date(fechaInicial).toLocaleString('default', { month: 'long', year: 'numeric' });
    if (!datos[mes]) {
      datos[mes] = [];
    }

    datos[mes].push({
      fecha_inicial: fechaInicial,
      fecha_final: fechaFinal,
      actividad,
      permiso_sandra: permisoSandra,
      viatico
    });

    await guardarDatos();
    renderizarTabs();
    form.reset();
    feedback.textContent = "✅ Actividad agregada";
  });

  const renderizarTabs = () => {
    const tabsContainer = document.getElementById("tabs");
    const tabContent = document.getElementById("tabContent");
    tabsContainer.innerHTML = "";
    tabContent.innerHTML = "";

    Object.keys(datos).forEach(mes => {
      const tab = document.createElement("button");
      tab.textContent = mes;
      tab.className = "border px-4 py-2 rounded hover:bg-gray-200";
      tab.onclick = () => renderizarTabla(mes);
      tabsContainer.appendChild(tab);
    });

    // Renderizar la primera pestaña por defecto
    if (Object.keys(datos).length > 0) {
      renderizarTabla(Object.keys(datos)[0]);
    }
  };

  const renderizarTabla = (mes) => {
    const tabContent = document.getElementById("tabContent");
    tabContent.innerHTML = "";

    const tabla = document.createElement("table");
    tabla.className = "min-w-full bg-white border border-gray-300 text-sm text-left rounded";
    tabla.innerHTML = `
      <thead class="bg-gray-100">
        <tr>
          <th class="px-4 py-2 border">Fecha Inicial</th>
          <th class="px-4 py-2 border">Fecha Final</th>
          <th class="px-4 py-2 border">Actividad</th>
          <th class="px-4 py-2 border">Permiso Sandra</th>
          <th class="px-4 py-2 border">Viático</th>
          <th class="px-4 py-2 border">Acciones</th>
        </tr>
      </thead>
      <tbody></tbody>
    `;

    datos[mes].forEach((data, index) => {
      const fila = document.createElement("tr");
      fila.innerHTML = `
        <td class="border px-2 py-1">${data.fecha_inicial}</td>
        <td class="border px-2 py-1">${data.fecha_final}</td>
        <td class="border px-2 py-1">${data.actividad}</td>
        <td class="border px-2 py-1">${data.permiso_sandra}</td>
        <td class="border px-2 py-1">${data.viatico}</td>
        <td class="border px-2 py-1 space-x-2">
          <button class="editar bg-yellow-400 px-2 py-1 rounded" data-index="${index}">✏️</button>
          <button class="eliminar bg-red-500 text-white px-2 py-1 rounded" data-index="${index}">🗑️</button>
        </td>
      `;
      tabla.querySelector('tbody').appendChild(fila);
    });

    tabContent.appendChild(tabla);
  };

  document.getElementById("exportExcel").addEventListener("click", () => {
    // Exportar a Excel
  });

  cargarDatos();
});
