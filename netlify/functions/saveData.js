const { Octokit } = require("@octokit/core");

exports.handler = async function (event, context) {
  const token = process.env.GITHUB_TOKEN;
  const owner = process.env.REPO_OWNER;
  const repo = process.env.REPO_NAME;
  const path = "data.json"; // archivo a actualizar

  if (!token || !owner || !repo) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Faltan variables de entorno" }),
      headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' }
    };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Método no permitido" }),
      headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' }
    };
  }

  const octokit = new Octokit({ auth: token });

  const body = JSON.parse(event.body || "{}");

  try {
    // 1. Obtener el archivo actual para recuperar el SHA
    const { data: fileData } = await octokit.request("GET /repos/{owner}/{repo}/contents/{path}", {
      owner,
      repo,
      path,
    });

    const sha = fileData.sha;

    // 2. Codificar el nuevo contenido como base64
    const updatedContent = Buffer.from(JSON.stringify(body, null, 2)).toString("base64");

    // 3. Hacer el commit del archivo actualizado
    await octokit.request("PUT /repos/{owner}/{repo}/contents/{path}", {
      owner,
      repo,
      path,
      message: "Actualizar data.json desde app web",
      content: updatedContent,
      sha: sha
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Datos guardados correctamente" }),
      headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' }
    };

  } catch (error) {
    console.error("Error al guardar:", error);
    return {
      statusCode: error.status || 500,
      body: JSON.stringify({ error: error.message, details: error.response?.data }),
      headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' }
    };
  }
};

