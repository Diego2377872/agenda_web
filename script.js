const API_GET = "/.netlify/functions/getData";
const API_POST = "/.netlify/functions/saveData";

const form = document.getElementById("actividadForm");
const tabla = document.getElementById("tablaActividades").querySelector("tbody");

let actividades = [];

// Cargar datos al iniciar
document.addEventListener("DOMContentLoaded", async () => {
  try {
    const res = await fetch(API_GET);
    if (!res.ok) throw new Error("No se pudo cargar datos");
    actividades = await res.json();
    renderizarTabla();
  } catch (err) {
    console.error("Error al cargar datos:", err);
    actividades = [];
    renderizarTabla();
  }
});

// Agregar actividad
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const nueva = {
    fecha: document.getElementById("fecha").value,
    actividad: document.getElementById("actividad").value,
    permisoSandra: document.getElementById("permisoSandra").value,
    viatico: document.getElementById("viatico").value,
  };

  actividades.push(nueva);
  renderizarTabla();
  form.reset();

  try {
    await guardarDatos();
  } catch (err) {
    alert("❌ Error al guardar en GitHub.");
    console.error(err);
  }
});

// Renderizar tabla
function renderizarTabla() {
  tabla.innerHTML = "";
  actividades.forEach((a, i) => {
    const fila = document.createElement("tr");
    fila.innerHTML = `
      <td>${a.fecha}</td>
      <td>${a.actividad}</td>
      <td>${a.permisoSandra}</td>
      <td>${a.viatico}</td>
      <td><button onclick="eliminar(${i})">🗑️</button></td>
    `;
    tabla.appendChild(fila);
  });
}

// Eliminar actividad
async function eliminar(index) {
  if (!confirm("¿Eliminar esta actividad?")) return;
  actividades.splice(index, 1);
  renderizarTabla();
  try {
    await guardarDatos();
  } catch (err) {
    alert("❌ Error al guardar tras eliminar.");
    console.error(err);
  }
}

// Guardar datos actualizados en GitHub
async function guardarDatos() {
  const res = await fetch(API_POST, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(actividades)
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.details || "Error desconocido");
  }
}

// Exportar CSV
function exportarCSV() {
  const rows = [
    ["Fecha", "Actividad", "Permiso entregado a Sandra", "Pedido de Viático"],
    ...actividades.map(a => [a.fecha, a.actividad, a.permisoSandra, a.viatico])
  ];

  const csv = rows.map(r => r.map(v => `"${v}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "actividades.csv";
  a.click();
  URL.revokeObjectURL(url);
}

// Exportar Excel (XLSX)
function exportarExcel() {
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(actividades);
  XLSX.utils.book_append_sheet(wb, ws, "Actividades");
  XLSX.writeFile(wb, "actividades.xlsx");
}

