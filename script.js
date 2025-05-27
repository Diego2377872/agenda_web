document.getElementById('actividadForm').addEventListener('submit', function (e) {
  e.preventDefault();

  const fechaInicio = document.getElementById('fechaInicio').value;
  const fechaFin = document.getElementById('fechaFin').value;
  const actividad = document.getElementById('actividad').value;
  const permisoSandra = document.getElementById('permisoSandra').value;
  const viatico = document.getElementById('viatico').value;

  const tabla = document.getElementById('tablaActividades').getElementsByTagName('tbody')[0];
  const nuevaFila = tabla.insertRow();

  nuevaFila.innerHTML = `
    <td>${fechaInicio}</td>
    <td>${fechaFin}</td>
    <td>${actividad}</td>
    <td>${permisoSandra}</td>
    <td>${viatico}</td>
    <td><button onclick="eliminarFila(this)">Eliminar</button></td>
  `;

  document.getElementById('actividadForm').reset();
});

function eliminarFila(boton) {
  const fila = boton.closest('tr');
  fila.remove();
}

function exportarExcel() {
  const tabla = document.getElementById('tablaActividades');
  const wb = XLSX.utils.table_to_book(tabla, { sheet: "Actividades" });
  XLSX.writeFile(wb, "registro_actividades.xlsx");
}
