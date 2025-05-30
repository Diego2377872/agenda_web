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

  flatpickr("#fechaInicial", { dateFormat: "Y-m-d" });
  flatpickr("#fechaFinal", { dateFormat: "Y-m-d" });

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

    // Mostrar mes y año actual arriba de la tabla (opcional)
    let tituloMes = document.getElementById("tituloMes");
    if (!tituloMes) {
      tituloMes = document.createElement("h2");
      tituloMes.id = "tituloMes";
      tituloMes.className = "text-xl font-semibold mb-4";
      tabla.parentElement.parentElement.insertBefore(tituloMes, tabla.parentElement);
    }
    const meses = [
      "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
      "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];
    tituloMes.textContent = `Mostrando actividades de ${meses[mesActual]} ${anioActual}`;

    // Filtrar datos por mes y año
    const datosFiltrados = datos.filter(d => {
      const fecha = new Date(d.fecha_inicial);
      return fecha.getMonth() === mesActual && fecha.getFullYear() === anioActual;
    });

    datosFiltrados.forEach((data) => {
      const fila = document.createElement("tr");
      fila.innerHTML = `
        <td class="border px-2 py-1">${data.fecha_inicial}</td>
        <td class="border px-2 py-1">${data.fecha_final}</td>
        <td class="border px-2 py-1">${data.actividad}</td>
        <td class="border px-2 py-1">${data.permiso_sandra}</td>
        <td class="border px-2 py-1">${data.viatico}</td>
        <td class="border px-2 py-1 space-x-2">
          <button class="editar bg-yellow-400 px-2 py-1 rounded">✏️</button>
          <button class="eliminar bg-red-500 text-white px-2 py-1 rounded">🗑️</button>
        </td>
      `;

      // Añadir eventos de eliminar y editar usando índice real en "datos"
      // Buscamos el índice absoluto en datos
      const indexReal = datos.indexOf(data);

      fila.querySelector(".eliminar").addEventListener("click", async () => {
        if (!confirm("¿Seguro que quieres eliminar esta actividad?")) return;
        datos.splice(indexReal, 1);
        await guardarDatos();
        renderizarTabla();
      });

      fila.querySelector(".editar").addEventListener("click", () => {
        const item = datos[indexReal];
        document.getElementById("fechaInicial").value = item.fecha_inicial;
        document.getElementById("fechaFinal").value = item.fecha_final;
        document.getElementById("actividad").value = item.actividad;
        document.getElementById("permisoSandra").value = item.permiso_sandra;
        document.getElementById("viatico").value = item.viatico;
        datos.splice(indexReal, 1); // Quitamos para que al guardar no se duplique
        renderizarTabla();
      });

      tabla.appendChild(fila);
    });

    if (datosFiltrados.length === 0) {
      const filaVacia = document.createElement("tr");
      filaVacia.innerHTML = `<td colspan="6" class="text-center p-4">No hay actividades para este mes</td>`;
      tabla.appendChild(filaVacia);
    }
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
        ? new Date(a.fecha_inicial) - new Date(b.fecha_inicial)
        : new Date(b.fecha_inicial) - new Date(a.fecha_inicial);
    });
    ordenAscendente = !ordenAscendente;
    renderizarTabla();
  });

  cargarDatos();
});

