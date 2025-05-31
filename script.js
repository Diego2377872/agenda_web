document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("actividadForm");
  const tabla = document.querySelector("#tablaActividades tbody");
  const feedback = document.createElement("div");
  form.after(feedback);

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
    console.log("Actividad guardada:", nuevaActividad); // Para depurar
    datos.push(nuevaActividad);
    await guardarDatos();
    renderizarTabla();
    form.reset();
    feedback.textContent = "✅ Actividad agregada";
  });

  const renderizarTabla = () => {
    tabla.innerHTML = "";

    const datosFiltrados = datos.filter(d => {
      const fecha = new Date(d.fecha_inicial + "T12:00:00"); // 🟢 Corrección aplicada aquí
      console.log(fecha, mesActual, anioActual); // Para depurar
      return fecha.getMonth() === mesActual && fecha.getFullYear() === anioActual;
    });

    console.log("Datos filtrados:", datosFiltrados); // Para depurar

    datosFiltrados.forEach((data, index) => {
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
        const realIndex = datos.findIndex((d, idx) => d.fecha_inicial === datosFiltrados[i].fecha_inicial && idx >= i);
        datos.splice(realIndex, 1);
        await guardarDatos();
        renderizarTabla();
      });
    });

    document.querySelectorAll(".editar").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const i = e.target.dataset.index;
        const item = datosFiltrados[i];
        document.getElementById("fechaInicial").value = item.fecha_inicial;
        document.getElementById("fechaFinal").value = item.fecha_final;
        document.getElementById("actividad").value = item.actividad;
        document.getElementById("permisoSandra").value = item.permiso_sandra;
        document.getElementById("viatico").value = item.viatico;
        const realIndex = datos.findIndex((d, idx) => d.fecha_inicial === item.fecha_inicial && idx >= i);
        datos.splice(realIndex, 1);
      });
    });
  };

  document.getElementById("exportExcel").addEventListener("click", () => {
    const ws = XLSX.utils.json_to_sheet(datos);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Actividades");
    XLSX.writeFile(wb, "actividades.xlsx");
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
        ? new Date(a.fecha_inicial + "T12:00:00") - new Date(b.fecha_inicial + "T12:00:00")
        : new Date(b.fecha_inicial + "T12:00:00") - new Date(a.fecha_inicial + "T12:00:00");
    });
    ordenAscendente = !ordenAscendente;
    renderizarTabla();
  });

  cargarDatos();
});
