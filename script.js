document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("actividadForm");
  const tabla = document.querySelector("#tablaActividades tbody");
  const feedback = document.createElement("div");
  feedback.style.margin = "10px 0";
  form.after(feedback);

  let datos = [];

  const cargarDatos = () => {
    // Simula la carga de datos
    datos = [
      { fecha: "2025-05-12", actividad: "Taller NDC", permiso_sandra: "Sí", viatico: "No" },
      // Agrega más datos si es necesario
    ];
    tabla.innerHTML = "";
    datos.forEach(agregarFila);
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
    form.reset();
    feedback.textContent = "✅ Actividad agregada";
    tabla.innerHTML = "";
    datos.forEach(agregarFila);
  });

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

  function descargarArchivo(contenido, nombre, tipo = "text/plain") {
    const blob = new Blob([contenido], { type: tipo });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = nombre;
    a.click();
    URL.revokeObjectURL(url);
  }
});
