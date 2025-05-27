<script>
  let filaEditando = null;

  document.getElementById('actividadForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const fechaInicio = document.getElementById('fechaInicio').value;
    const fechaFin = document.getElementById('fechaFin').value;
    const actividad = document.getElementById('actividad').value;
    const permisoSandra = document.getElementById('permisoSandra').value;
    const viatico = document.getElementById('viatico').value;

    if (filaEditando) {
      // Editar la fila existente
      filaEditando.cells[0].textContent = fechaInicio;
      filaEditando.cells[1].textContent = fechaFin;
      filaEditando.cells[2].textContent = actividad;
      filaEditando.cells[3].textContent = permisoSandra;
      filaEditando.cells[4].textContent = viatico;
      filaEditando = null;
      document.querySelector('#actividadForm button[type="submit"]').textContent = "Agregar";
    } else {
      // Crear una nueva fila
      const tabla = document.getElementById('tablaActividades').getElementsByTagName('tbody')[0];
      const nuevaFila = tabla.insertRow();

      nuevaFila.innerHTML = `
        <td>${fechaInicio}</td>
        <td>${fechaFin}</td>
        <td>${actividad}</td>
        <td>${permisoSandra}</td>
        <td>${viatico}</td>
        <td>
          <button onclick="editarFila(this)">Editar</button>
          <button onclick="eliminarFila(this)">Eliminar</button>
        </td>
      `;
    }

    document.getElementById('actividadForm').reset();
  });

  function eliminarFila(boton) {
    const fila = boton.closest('tr');
    if (fila === filaEditando) {
      document.getElementById('actividadForm').reset();
      document.querySelector('#actividadForm button[type="submit"]').textContent = "Agregar";
      filaEditando = null;
    }
    fila.remove();
  }

  function editarFila(boton) {
    filaEditando = boton.closest('tr');

    document.getElementById('fechaInicio').value = filaEditando.cells[0].textContent;
    document.getElementById('fechaFin').value = filaEditando.cells[1].textContent;
    document.getElementById('actividad').value = filaEditando.cells[2].textContent;
    document.getElementById('permisoSandra').value = filaEditando.cells[3].textContent;
    document.getElementById('viatico').value = filaEditando.cells[4].textContent;

    document.querySelector('#actividadForm button[type="submit"]').textContent = "Guardar Cambios";
  }

  function exportarExcel() {
    const tabla = document.getElementById('tablaActividades');
    const wb = XLSX.utils.table_to_book(tabla, { sheet: "Actividades" });
    XLSX.writeFile(wb, "registro_actividades.xlsx");
  }
</script>
