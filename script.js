
// script.js

let datos = [];

async function cargarDatos() {
  try {
    const response = await fetch('/.netlify/functions/get');
    datos = await response.json();
    renderizarTabla();
  } catch (error) {
    console.error("Error al cargar los datos:", error);
  }
}

function renderizarTabla() {
  const tbody = document.querySelector("#tablaActividades tbody");
  tbody.innerHTML = "";

  datos.forEach((registro, index) => {
    const fila = document.createElement("tr");

    fila.innerHTML = `
      <td>${registro.fecha}</td>
      <td>${registro.actividad}</td>
      <td>${registro.permiso_sandra}</td>
      <td>${registro.viatico}</td>
      <td><button onclick="eliminarRegistro(${index})">Eliminar</button></td>
    `;

    tbody.appendChild(fila);
  });
}

document.getElementById("actividadForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const nuevoRegistro = {
    fecha: document.getElementById("fecha").value,
    actividad: document.getElementById("actividad").value,
    permiso_sandra: document.getElementById("permisoSandra").value,
    viatico: document.getElementById("viatico").value
  };

  datos.push(nuevoRegistro);
  await guardarDatos();
  renderizarTabla();
  this.reset();
});

async function guardarDatos() {
  try {
    await fetch('/.netlify/functions/save', {
      method: "POST",
      body: JSON.stringify(datos)
    });
  } catch (error) {
    console.error("Error al guardar los datos:", error);
  }
}

function eliminarRegistro(index) {
  datos.splice(index, 1);
  guardarDatos();
  renderizarTabla();
}

function exportarCSV() {
  let csv = "Fecha,Actividad,Permiso entregado a Sandra,Pedido de Viático\n";
  datos.forEach(d => {
    csv += `${d.fecha},${d.actividad},${d.permiso_sandra},${d.viatico}\n`;
  });

  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "actividades.csv";
  a.click();
  URL.revokeObjectURL(url);
}

function exportarExcel() {
  let tabla = document.getElementById("tablaActividades").outerHTML;
  let blob = new Blob([tabla], { type: "application/vnd.ms-excel" });
  let url = URL.createObjectURL(blob);
  let a = document.createElement("a");
  a.href = url;
  a.download = "actividades.xls";
  a.click();
  URL.revokeObjectURL(url);
}

window.onload = cargarDatos;

