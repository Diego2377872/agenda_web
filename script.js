document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("actividadForm");
  const tabla = document.querySelector("#tablaActividades tbody");

  // Cargar datos desde el archivo JSON (si está en entorno estático, puedes comentar esto)
  fetch("data.json")
    .then(res => res.json())
    .then(data => {
      data.forEach(agregarFila);
    });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const nuevaActividad = {
      fecha: document.getElementById("fecha").value,
      actividad: document.getElementById("actividad").value,
      permiso_sandra: document.getElementById("permisoSandra").value,
      viatico: document.getElementById("viatico").value
    };
    agregarFila(nuevaActividad);
    form.reset();
  });

  function agregarFila(data) {
    const fila = document.createElement("tr");
    fila.innerHTML = `
      <td>${data.fecha}</td>
      <td>${data.actividad}</td>
      <td>${data.permiso_sandra}</td>
      <td>${data.viatico}</td>
      <td>
        <button onclick="editarFila(this)">Editar</button>
        <button onclick="eliminarFila(this)">Eliminar</button>
      </td>
    `;
    tabla.appendChild(fila);
  }
});

function editarFila(boton) {
  const fila = boton.parentElement.parentElement;
  const celdas = fila.querySelectorAll("td");

  const nuevosDatos = {
    fecha: prompt("Editar Fecha:", celdas[0].textContent),
    actividad: prompt("Editar Actividad:", celdas[1].textContent),
    permiso_sandra: prompt("Editar Permiso entregado a Sandra:", celdas[2].textContent),
    viatico: prompt("Editar Pedido de Viático (Sí/No):", celdas[3].textContent)
  };

  if (nuevosDatos.fecha) celdas[0].textContent = nuevosDatos.fecha;
  if (nuevosDatos.actividad) celdas[1].textContent = nuevosDatos.actividad;
  if (nuevosDatos.permiso_sandra) celdas[2].textContent = nuevosDatos.permiso_sandra;
  if (nuevosDatos.viatico) celdas[3].textContent = nuevosDatos.viatico;
}

function eliminarFila(boton) {
  const fila = boton.parentElement.parentElement;
  fila.remove();
}

function exportarCSV() {
  const filas = document.querySelectorAll("table tr");
  let csv = "";
  filas.forEach(fila => {
    const celdas = fila.querySelectorAll("td, th");
    const filaTexto = [...celdas].map(td => `"${td.textContent}"`).join(",");
    csv += filaTexto + "\n";
  });
  descargarArchivo(csv, "actividades.csv", "text/csv");
}

function exportarExcel() {
  let tablaHTML = document.querySelector("table").outerHTML;
  let dataUri = 'data:application/vnd.ms-excel,' + encodeURIComponent(tablaHTML);
  descargarArchivo(dataUri, "actividades.xls");
}

function descargarArchivo(contenido, nombre, tipo = "text/plain") {
  const blob = new Blob([contenido], { type: tipo });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = nombre;
  link.click();
}
