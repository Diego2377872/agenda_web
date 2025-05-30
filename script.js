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

  const nombreMes = (mes) => {
    return [
      "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
      "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ][mes];
  };

  const actualizarTituloMes = () => {
    document.getElementById("mesActual").textContent = `${nombreMes(mesActual)} ${anioActual}`;
  };

  const cargarDatos = async () => {
    try {
      const response = await fetch("/.netlify/functions/getData");
      if (!response.ok) throw new Error("Error al cargar datos");
      datos = await response.json();
      renderizarTabla();
      actualizarTituloMes();
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
    feedback.textContent = "✅ Actividad agregada";
    form.reset();
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
        <td class="border px-2 py-1">${data.fecha_inicial}</td>
        <td class="border px-2 py-1">${data.fecha_final}</td>
        <td class="border px-2 py-1">${data.actividad}</td>
        <td class="border px-2 py-1">${data.permiso_sandra}</td>
        <td class="border px-2 py-1">${data.viatico}</td>
        <td class="border px-2 py-1 space-x-2 text-center">
          <button class="editar bg-yellow-400 px-2 py-1 rounded" data-index="${index}">✏️</button>
          <button class="eliminar bg-red-500 text-white px-2 py-1 rounded" data-index="${index}">🗑️</button>
        </td>
      `;
      tabla.appendChild(fila);
    });

    document.querySelectorAll(".eliminar").forEach(btn => {
      btn.addEventListener("click", async (e) => {
        const i = e.target.dataset.index;
        // Encuentra índice real dentro de datos originales
        const realIndex = datos.findIndex(d => d.fecha_inicial === datosFiltrados[i].fecha_inicial && d.fecha_final === datosFiltrados[i].fecha_final && d.actividad === datosFiltrados[i].actividad);
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
        // Eliminar el ítem para actualizar después
        const realIndex = datos.findIndex(d => d.fecha_inicial === item.fecha_inicial && d.fecha_final === item.fecha_final && d.actividad === item.actividad);
        datos.splice(realIndex, 1);
        guardarDatos();
        renderizarTabla();
      });
    });
  };

  ordenarFechaBtn.addEventListener("click", () => {
    datos.sort((a, b) => {
      const dateA = new Date(a.fecha_inicial);
      const dateB = new Date(b.fecha_inicial);
      return ordenAscendente ? dateA - dateB : dateB - dateA;
    });
    ordenAscendente = !ordenAscendente;
    renderizarTabla();
  });

  anteriorBtn.addEventListener("click", () => {
    mesActual--;
    if (mesActual < 0) {
      mesActual = 11;
      anioActual--;
    }
    renderizarTabla();
    actualizarTituloMes();
  });

  siguienteBtn.addEventListener("click", () => {
    mesActual++;
    if (mesActual > 11) {
      mesActual = 0;
      anioActual++;
    }
    renderizarTabla();
    actualizarTituloMes();
  });

  document.getElementById("exportExcel").addEventListener("click", () => {
    exportarExcel();
  });

  const exportarExcel = () => {
    const wb = XLSX.utils.book_new();
    const datosFiltrados = datos.filter(d => {
      const fecha = new Date(d.fecha_inicial);
      return fecha.getMonth() === mesActual && fecha.getFullYear() === anioActual;
    });

    const wsData = [
      ["Fecha Inicial", "Fecha Final", "Actividad", "Permiso Entregado", "Viático"],
      ...datosFiltrados.map(d => [d.fecha_inicial, d.fecha_final, d.actividad, d.permiso_sandra, d.viatico])
    ];

    const ws = XLSX.utils.aoa_to_sheet(wsData);
    XLSX.utils.book_append_sheet(wb, ws, "Actividades");
    XLSX.writeFile(wb, `Actividades_${nombreMes(mesActual)}_${anioActual}.xlsx`);
  };

  cargarDatos();
});

