document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("actividadForm");
  const tabla = document.querySelector("#tablaActividades tbody");
  const feedback = document.createElement("div");
  form.after(feedback);

  const anteriorBtn = document.getElementById("anteriorMes");
  const siguienteBtn = document.getElementById("siguienteMes");
  const ordenarFechaBtn = document.getElementById("ordenarFecha");
  const guardarDatosBtn = document.getElementById("guardarDatos");

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
        <td class="border px-2 py-1">${data.fecha_inicial}</td>
        <td class="border px-2 py-1">${data.fecha_final}</td>
        <td class="border px-2 py-1">${data.actividad}</td>
        <td class="border px-2 py-1">${data.permiso_sandra}</td>
        <td class="border px-2 py-1">${data.viatico}</td>
        <td class="border px-2 py-1 space-x-2">
          <button class="editar bg-yellow-400 text-white px-2 py-1 rounded" data-index="${index}">✏️</button>
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
        const fila = tabla.children[i];
        const campos = ['fecha_inicial', 'fecha_final', 'actividad', 'permiso_sandra', 'viatico'];

        campos.forEach((campo, j) => {
          const td = fila.children[j];
          const input = document.createElement("input");
          input.type = campo.includes("fecha") ? "date" : "text";
          input.value = datos[i][campo];
          td.innerHTML = "";
          td.appendChild(input);
        });

        const accionesTd = fila.children[5];
        accionesTd.innerHTML = `
          <button class="guardar bg-green-500 text-white px-2 py-1 rounded" data-index="${i}">💾</button>
          <button class="eliminar bg-red-500 text-white px-2 py-1 rounded" data-index="${i}">🗑️</button>
        `;

        accionesTd.querySelector(".guardar").addEventListener("click", async () => {
          campos.forEach((campo, j) => {
            const input = fila.children[j].querySelector("input");
            datos[i][campo] = input.value;
          });
          await guardarDatos();
          renderizarTabla();
        });

        accionesTd.querySelector(".eliminar").addEventListener("click", async (e) => {
          const idx = e.target.dataset.index;
          datos.splice(idx, 1);
          await guardarDatos();
          renderizarTabla();
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
