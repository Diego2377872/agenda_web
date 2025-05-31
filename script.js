document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("actividadForm");
  const tabla = document.querySelector("#tablaActividades tbody");
  const feedback = document.createElement("div");
  form.after(feedback);

  const guardarDatosBtn = document.getElementById("guardarDatos");
  const anteriorBtn = document.getElementById("anteriorMes");
  const siguienteBtn = document.getElementById("siguienteMes");
  const ordenarFechaBtn = document.getElementById("ordenarFecha");

  let datos = [];
  let mesActual = new Date().getMonth();
  let anioActual = new Date().getFullYear();
  let ordenAscendente = true;

  const cargarDatos = async () => {
    try {
      const response = await fetch("/.netlify/functions/getData");
      if (!response.ok) throw new Error("Error al cargar datos");
      datos = await response.json();
      renderizarTabla();
    } catch (error) {
      feedback.textContent = "❌ " + error.message;
    }
  };

  const guardarDatos = async () => {
    try {
      const response = await fetch("/.netlify/functions/saveData", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datos)
      });
      if (!response.ok) throw new Error("Error al guardar datos");
    } catch (error) {
      feedback.textContent = "❌ " + error.message;
    }
  };

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const nuevaActividad = {
      fecha_inicial: document.getElementById("fechaInicial").value,
      fecha_final: document.getElementById("fechaFinal").value,
      actividad: document.getElementById("actividad").value,
      permiso_sandra: document.getElementById("permisoSandra").value,
      viatico: document.getElementById("viatico").value
    };
    datos.push(nuevaActividad);
    await guardarDatos();
    renderizarTabla();
    form.reset();
    feedback.textContent = "✅ Actividad agregada";
  });

  const renderizarTabla = () => {
    tabla.innerHTML = "";
    const datosFiltrados = datos.filter(d => {
      const fecha = new Date(d.fecha_inicial);
      return fecha.getMonth() === mesActual && fecha.getFullYear() === anioActual;
    });

    datosFiltrados.forEach((data, index) => {
      const fila = document.createElement("tr");
      fila.innerHTML = `
        <td class="border px-2 py-1" data-field="fecha_inicial" data-index="${index}">${data.fecha_inicial}</td>
        <td class="border px-2 py-1" data-field="fecha_final" data-index="${index}">${data.fecha_final}</td>
        <td class="border px-2 py-1" data-field="actividad" data-index="${index}">${data.actividad}</td>
        <td class="border px-2 py-1" data-field="permiso_sandra" data-index="${index}">${data.permiso_sandra}</td>
        <td class="border px-2 py-1" data-field="viatico" data-index="${index}">${data.viatico}</td>
        <td class="border px-2 py-1 space-x-2">
          <button class="eliminar bg-red-500 text-white px-2 py-1 rounded" data-index="${index}">🗑️</button>
        </td>
      `;
      tabla.appendChild(fila);
    });

    // Evento de eliminación
    document.querySelectorAll(".eliminar").forEach(btn => {
      btn.addEventListener("click", async (e) => {
        const i = e.target.dataset.index;
        datos.splice(i, 1);
        await guardarDatos();
        renderizarTabla();
      });
    });

    // Evento de edición inline
    document.querySelectorAll("#tablaActividades td[data-field]").forEach(td => {
      td.addEventListener("click", () => {
        const field = td.getAttribute("data-field");
        const index = td.getAttribute("data-index");
        const valorOriginal = td.textContent;

        const input = document.createElement("input");
        input.type = "text";
        input.value = valorOriginal;
        input.className = "w-full border rounded px-1";

        td.textContent = "";
        td.appendChild(input);
        input.focus();

        const guardarCambio = () => {
          const nuevoValor = input.value.trim();
          if (nuevoValor !== "") {
            datos[index][field] = nuevoValor;
            td.textContent = nuevoValor;
          } else {
            td.textContent = valorOriginal;
          }
        };

        input.addEventListener("blur", guardarCambio);
        input.addEventListener("keypress", e => {
          if (e.key === "Enter") {
            guardarCambio();
          }
        });
      });
    });
  };

  guardarDatosBtn.addEventListener("click", async () => {
    await guardarDatos();
    feedback.textContent = "✅ Cambios guardados correctamente";
  });

  anteriorBtn.addEventListener("click", () => {
    mesActual--;
    if (mesActual < 0) {
      mesActual = 11;
      anioActual--;
    }
    renderizarTabla();
  });

  siguienteBtn.addEventListener("click", () => {
    mesActual++;
    if (mesActual > 11) {
      mesActual = 0;
      anioActual++;
    }
    renderizarTabla();
  });

  ordenarFechaBtn.addEventListener("click", () => {
    datos.sort((a, b) => {
      return ordenAscendente 
        ? new Date(a.fecha_inicial) - new Date(b.fecha_inicial)
        : new Date(b.fecha_inicial) - new Date(a.fecha_inicial);
    });
    ordenAscendente = !ordenAscendente;
    renderizarTabla();
  });

  document.getElementById("exportExcel").addEventListener("click", () => {
    const ws = XLSX.utils.json_to_sheet(datos);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Actividades");
    XLSX.writeFile(wb, "actividades.xlsx");
  });

  cargarDatos();
});

