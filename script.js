document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("actividadForm");
  const tabla = document.querySelector("#tablaActividades tbody");
  const feedback = document.createElement("div"); // Para mensajes de estado
  feedback.style.margin = "10px 0";
  form.after(feedback);

  let datos = [];

  // Cargar datos iniciales
  const cargarDatos = () => {
    fetch("/.netlify/functions/getData") // Cambiado a getData
      .then(res => {
        if (!res.ok) throw new Error("Error al cargar datos");
        return res.json();
      })
      .then(data => {
        datos = data;
        tabla.innerHTML = "";
        data.forEach(agregarFila);
      })
      .catch(err => {
        feedback.textContent = "❌ " + err.message;
        console.error(err);
      });
  };

  // Agregar nueva actividad
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const nuevaActividad = {
      fecha: document.getElementById("fecha").value,
      actividad: document.getElementById("actividad").value,
      permiso_sandra: document.getElementById("permisoSandra").value,
      viatico: document.getElementById("viatico").value
    };

    try {
      await guardarDatos([...datos, nuevaActividad]);
      form.reset();
      feedback.textContent = "✅ Actividad agregada";
    } catch (err) {
      feedback.textContent = "❌ Error al guardar";
    }
  });

  // Helpers
  const agregarFila = (data, index) => {
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
    fila.querySelector(".editar").addEventListener("click", () => editarFila(index));
    fila.querySelector(".eliminar").addEventListener("click", () => eliminarFila(index));
    tabla.appendChild(fila);
  };

  const editarFila = (index) => {
    const actividad = datos[index];
    const nuevosDatos = {
      fecha: prompt("Fecha:", actividad.fecha),
      actividad: prompt("Actividad:", actividad.actividad),
      permiso_sandra: prompt("Permiso Sandra:", actividad.permiso_sandra),
      viatico: prompt("Viático (Sí/No):", actividad.viatico)
    };

    if (Object.values(nuevosDatos).every(Boolean)) {
      datos[index] = nuevosDatos;
      guardarDatos(datos);
    }
  };

  const eliminarFila = (index) => {
    if (confirm("¿Eliminar esta actividad?")) {
      datos.splice(index, 1);
      guardarDatos(datos);
    }
  };

  const guardarDatos = async (nuevosDatos) => {
    try {
      const res = await fetch("/.netlify/functions/saveData", { // Cambiado a saveData
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nuevosDatos)
      });

      if (!res.ok) throw new Error("Error en el servidor");
      
      datos = nuevosDatos;
      tabla.innerHTML = "";
      datos.forEach(agregarFila);
      return true;
    } catch (err) {
      feedback.textContent = "❌ Error al guardar cambios";
      console.error(err);
      return false;
    }
  };

  // Exportadores
  window.exportarCSV = () => {
    const filas = Array.from(tabla.querySelectorAll("tr"));
    const headers = Array.from(document.querySelectorAll("th")).map(th => `"${th.textContent}"`).join(",");
    const csv = [
      headers,
      ...filas.map(tr => 
        Array.from(tr.querySelectorAll("td")).map(td => `"${td.textContent}"`).join(",")
      )
    ].join("\n");

    descargarArchivo(csv, "actividades.csv", "text/csv");
  };

  // Inicialización
  cargarDatos();
});

function descargarArchivo(contenido, nombre, tipo = "text/plain") {
  const blob = new Blob([contenido], { type: tipo });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nombre;
  a.click();
  URL.revokeObjectURL(url);
}