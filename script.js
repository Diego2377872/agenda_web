document.addEventListener("DOMContentLoaded", () => { 
  const form = document.getElementById("actividadForm");
  const tabla = document.querySelector("#tablaActividades tbody");
  const feedback = document.createElement("div");
  form.after(feedback);
  let datos = [];

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
    datos.forEach((data, index) => {
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
      tabla.appendChild(fila);
    });

    document.querySelectorAll(".eliminar").forEach(btn => {
      btn.addEventListener("click", async (e) => {
        const i = e.target.dataset.index;
        datos.splice(i, 1);
        await guardarDatos();
        renderizarTabla();
      });
    });

    document.querySelectorAll(".editar").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const i = e.target.dataset.index;
        const item = datos[i];
        document.getElementById("fechaInicial").value = item.fecha_inicial;
        document.getElementById("fechaFinal").value = item.fecha_final;
        document.getElementById("actividad").value = item.actividad;
        document.getElementById("permisoSandra").value = item.permiso_sandra;
        document.getElementById("viatico").value = item.viatico;
        datos.splice(i, 1); // Lo quitamos temporalmente para editar
      });
    });
  };

  // Funcionalidad de orden por fecha inicial
  document.getElementById("ordenarFechaInicial").addEventListener("click", () => {
    datos.sort((a, b) => {
      const fechaA = new Date(a.fecha_inicial);
      const fechaB = new Date(b.fecha_inicial);
      return ordenAscendente ? fechaA - fechaB : fechaB - fechaA;
    });
    ordenAscendente = !ordenAscendente;
    actualizarIconoOrden();
    renderizarTabla();
  });

  function actualizarIconoOrden() {
    const icono = document.getElementById("iconoOrdenFecha");
    if (ordenAscendente) {
      icono.textContent = "⬆️";
    } else {
      icono.textContent = "⬇️";
    }
  }

  document.getElementById("exportExcel").addEventListener("click", () => {
    const ws = XLSX.utils.json_to_sheet(datos);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Actividades");
    XLSX.writeFile(wb, "actividades.xlsx");
  });

  cargarDatos();
});




