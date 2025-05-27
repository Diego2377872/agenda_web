<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Registro de Actividades</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 20px;
      background-color: #f4f4f4;
      color: #333;
    }
    h1 {
      color: #0056b3;
      text-align: center;
    }
    form {
      background-color: #fff;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      margin-bottom: 30px;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
    }
    form input[type="date"],
    form input[type="text"],
    form select,
    form button {
      padding: 10px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 1rem;
    }
    form button {
      background-color: #007bff;
      color: white;
      cursor: pointer;
      grid-column: span 2; /* Make the button span both columns */
    }
    form button:hover {
      background-color: #0056b3;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 20px;
      background-color: #fff;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    table th,
    table td {
      border: 1px solid #ddd;
      padding: 10px;
      text-align: left;
    }
    table th {
      background-color: #e9e9e9;
      color: #333;
    }
    table tr:nth-child(even) {
      background-color: #f9f9f9;
    }
    table button {
      background-color: #dc3545;
      color: white;
      border: none;
      padding: 8px 12px;
      border-radius: 4px;
      cursor: pointer;
    }
    table button:hover {
      background-color: #c82333;
    }
    .export-button {
      background-color: #28a745;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 4px;
      cursor: pointer;
      display: block;
      margin: 20px auto;
      font-size: 1rem;
    }
    .export-button:hover {
      background-color: #218838;
    }
  </style>
</head>
<body>
  <h1>Registro de Actividades</h1>
  
  <form id="actividadForm">
    <input type="date" id="fechaInicio" required />
    <input type="date" id="fechaFin" required />
    <input type="text" id="actividad" required placeholder="Actividad" />
    <input type="text" id="permisoSandra" placeholder="Permiso entregado a Sandra" />
    <select id="viatico" required>
      <option value="">¿Viático?</option>
      <option value="Sí">Sí</option>
      <option value="No">No</option>
    </select>
    <button type="submit">Agregar Actividad</button>
  </form>

  <table id="tablaActividades" border="1">
    <thead>
      <tr>
        <th>Fecha Inicial</th>
        <th>Fecha Final</th>
        <th>Actividad</th>
        <th>Permiso entregado a Sandra</th>
        <th>Pedido de Viático (Sí/No)</th>
        <th>Acciones</th>
      </tr>
    </thead>
    <tbody></tbody>
  </table>

  <button onclick="exportarExcel()" class="export-button">Exportar a Excel</button>

  <script src="https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js"></script>

  <script>
    // Array para almacenar las actividades
    let actividades = [];

    // Función para cargar actividades desde localStorage
    function cargarActividades() {
      const actividadesGuardadas = localStorage.getItem('actividades');
      if (actividadesGuardadas) {
        actividades = JSON.parse(actividadesGuardadas);
        renderizarTabla();
      }
    }

    // Función para guardar actividades en localStorage
    function guardarActividades() {
      localStorage.setItem('actividades', JSON.stringify(actividades));
    }

    // Función para renderizar la tabla con las actividades actuales
    function renderizarTabla() {
      const tablaBody = document.getElementById('tablaActividades').getElementsByTagName('tbody')[0];
      tablaBody.innerHTML = ''; // Limpiar la tabla antes de renderizar

      actividades.forEach((act, index) => {
        const nuevaFila = tablaBody.insertRow();
        nuevaFila.innerHTML = `
          <td>${act.fechaInicio}</td>
          <td>${act.fechaFin}</td>
          <td>${act.actividad}</td>
          <td>${act.permisoSandra}</td>
          <td>${act.viatico}</td>
          <td><button onclick="eliminarFila(${index})">Eliminar</button></td>
        `;
      });
    }

    // Event listener para el envío del formulario
    document.getElementById('actividadForm').addEventListener('submit', function (e) {
      e.preventDefault(); // Evitar que el formulario se envíe de forma predeterminada

      const fechaInicio = document.getElementById('fechaInicio').value;
      const fechaFin = document.getElementById('fechaFin').value;
      const actividad = document.getElementById('actividad').value;
      const permisoSandra = document.getElementById('permisoSandra').value;
      const viatico = document.getElementById('viatico').value;

      // Validación de fechas
      if (new Date(fechaInicio) > new Date(fechaFin)) {
        alert('La Fecha Final no puede ser anterior a la Fecha Inicial.');
        return; // Detener la ejecución si la validación falla
      }

      // Crear un objeto con los datos de la actividad
      const nuevaActividad = {
        fechaInicio,
        fechaFin,
        actividad,
        permisoSandra,
        viatico
      };

      // Añadir la nueva actividad al array
      actividades.push(nuevaActividad);
      guardarActividades(); // Guardar en localStorage
      renderizarTabla();   // Actualizar la tabla

      document.getElementById('actividadForm').reset(); // Limpiar el formulario
      alert('Actividad agregada exitosamente.');
    });

    // Función para eliminar una fila de la tabla y del array de actividades
    function eliminarFila(index) {
      if (confirm('¿Estás seguro de que quieres eliminar esta actividad?')) {
        actividades.splice(index, 1); // Eliminar la actividad del array
        guardarActividades();         // Guardar los cambios en localStorage
        renderizarTabla();            // Volver a renderizar la tabla
        alert('Actividad eliminada.');
      }
    }

    // Función para exportar la tabla a un archivo Excel
    function exportarExcel() {
      const tabla = document.getElementById('tablaActividades');
      const wb = XLSX.utils.table_to_book(tabla, { sheet: "Actividades" });
      XLSX.writeFile(wb, "registro_actividades.xlsx");
      alert('Datos exportados a registro_actividades.xlsx');
    }

    // Cargar actividades al cargar la página
    document.addEventListener('DOMContentLoaded', cargarActividades);
  </script>
</body>
</html>
