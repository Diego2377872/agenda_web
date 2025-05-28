document.addEventListener("DOMContentLoaded", async () => {
  const form = document.getElementById("actividadForm");
  const tabla = document.querySelector("#tablaActividades tbody");
  const feedback = document.createElement("div");
  feedback.style.margin = "10px 0";
  form.after(feedback);

  let datos = [];

  const cargarDatos = async () => {
    try {
      const response = await fetch("/.netlify/functions/getData");
      if (!response.ok) throw new Error("Error al cargar datos");
      datos = await response.json();
      tabla.innerHTML = "";
      datos.forEach((data, index) => agregarFila(data, index));
    } catch (error) {
      feedback.textContent = "❌ " + error.message;
    }
  };

  const guardarDatos = async (nuevosDatos) => {
    try {
      const response = await fetch("/.netlify/functions/saveData", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nuevosDatos),
      });

      if (!response.ok) throw new Error("Error al guardar datos");
      tabla.innerHTML = "";
      nuevosDatos.forEach((data, index) => agregarFila(data, index));
    } catch (error) {
      feedback.textContent = "❌ " + error.message;
    }
  };

  const agregarFila = (data, index) => {
    const fila = document.createElement("tr");
    fila.innerHTML = `
      <td><input type="date" value="${data.fecha}" data-index="${index}" class="editable fecha" /></td>
      <td><input type="text" value="${data.actividad}" data-index="${index}" class="editable actividad" /></td>
      <td><input type="text" value="${data.permiso_sandra}" data-index="${index}" class="editable permiso" /></td>
      <td><input type="text" value="${data.viatico}" data-index="${index}" class="editable viatico" /></td>
      <td>
        <button class="guardar" data-index="${index}">💾</button>
        <button class="eliminar" data-index="${index}">🗑️</button>
      </td>
    `;
    tabla.appendChild(fila);
  };

  tabla.addEventListener("click", async (e) => {
    const index = e.target.dataset.index;

    if (e.target.classList.contains("guardar")) {
      const fila = tabla.rows[index];
      datos[index] = {
        fecha: fila.querySelector(".fecha").value,
        actividad: fila.querySelector(".actividad").value,
        permiso_sandra: fila.querySelector(".permiso").value,
        viatico: fila.querySelector(".viatico").value,
      };
      await guardarDatos(datos);
      feedback.textContent = "✅ Actividad actualizada";
    }

    if (e.target.classList.contains("eliminar")) {
      if (confirm("¿Seguro que deseas eliminar esta actividad?")) {
        datos.splice(index, 1);
        await guardarDatos(datos);
        feedback.textContent = "✅ Actividad eliminada";
      }
    }
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const nuevaActividad = {
      fecha: document.getElementById("fecha").value,
      actividad: document.getElementById("actividad").value,
      permiso_sandra: document.getElementById("permisoSandra").value,
      viatico: document.getElementById("viatico").value,
    };
    datos.push(nuevaActividad);
    await guardarDatos(datos);
    form.reset();
    feedback.textContent = "✅ Actividad agregada";
  });

  await cargarDatos();
});
