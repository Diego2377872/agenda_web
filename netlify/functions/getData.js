const { Octokit } = require("@octokit/rest")

// Validamos variables de entorno críticas al inicio
const validateEnv = () => {
  if (!process.env.GH_TOKEN) {
    throw new Error("❌ Falta la variable de entorno GH_TOKEN")
  }
}

exports.handler = async function () {
  try {
    validateEnv() // Verificamos las variables

    const octokit = new Octokit({ 
      auth: process.env.GH_TOKEN,
      userAgent: "netlify-function-v1", // Identificador para GitHub
      timeZone: "America/Asuncion"      // Ajusta según tu región
    })

    // Configuración centralizada (cámbiala según tu repo)
    const repoConfig = {
      owner: "TU_USUARIO_GITHUB",       // Reemplázalo
      repo: "NOMBRE_DEL_REPOSITORIO",   // Reemplázalo
      path: "data.json",
      branch: "main",
      headers: {
        "X-GitHub-Api-Version": "2022-11-28" // Versión estable de la API
      }
    }

    // Obtenemos el archivo
    const { data: file } = await octokit.rest.repos.getContent({
      owner: repoConfig.owner,
      repo: repoConfig.repo,
      path: repoConfig.path,
      ref: repoConfig.branch,
      headers: repoConfig.headers
    })

    // Verificamos que el contenido sea válido
    if (!file.content || !file.encoding) {
      throw new Error("Formato de archivo GitHub inválido")
    }

    const content = Buffer.from(file.content, "base64").toString("utf-8")

    // Validamos que sea JSON parseable
    JSON.parse(content) // Si falla, lanzará error

    return {
      statusCode: 200,
      body: content,
      headers: { 
        "Content-Type": "application/json",
        "Cache-Control": "max-age=60" // Cache de 1 minuto para reducir llamadas
      }
    }

  } catch (error) {
    console.error("Error en getData:", error.message)
    
    return {
      statusCode: error.status || 500,
      body: JSON.stringify({ 
        error: "Error al obtener datos",
        details: error.message 
      }),
      headers: { "Content-Type": "application/json" }
    }
  }
}
