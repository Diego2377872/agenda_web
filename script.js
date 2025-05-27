document.addEventListener("DOMContentLoaded", () => {
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
      const data = await response.json();
      datos = data;
      tabla.innerHTML = "";
      datos.forEach(agregarFila);
    } catch (error) {
      feedback.textContent = "❌ " + error.message;
    }
  };

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const nuevaActividad = {
      fecha: document.getElementById("fecha").value,
      actividad: document.getElementById("actividad").value,
      permiso_sandra: document.getElementById("permisoSandra").value,
      viatico: document.getElementById("viatico").value
    };

    datos.push(nuevaActividad);
    await guardarDatos(datos);
    form.reset();
    feedback.textContent = "✅ Actividad agregada";
  });

  const guardarDatos = async (nuevosDatos) => {
    try {
      const response = await fetch("/.netlify/functions/saveData", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nuevosDatos)
      });

      if (!response.ok) throw new Error("Error al guardar datos");
      tabla.innerHTML = "";
      nuevosDatos.forEach(agregarFila);
    } catch (error) {
      feedback.textContent = "❌ " + error.message;
    }
  };

  const agregarFila = (data) => {
    const fila = document.createElement("tr");
    fila.innerHTML = `
      <td>${data.fecha}</td>
      <td>${data.actividad}</td>
      <td>${data.permiso_sandra}</td>
      <td>${data.viatico}</td>
      <td>
        <button class="editar">Editar</button>
        <button class="eliminar">Eliminar</button>
      </td>
    `;
    tabla.appendChild(fila);
  };

  cargarDatos();
});
