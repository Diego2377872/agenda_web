const { Octokit } = require("@octokit/core");

exports.handler = async function (event, context) {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: "Método no permitido",
    };
  }

  const token = process.env.GITHUB_TOKEN;
  const owner = process.env.REPO_OWNER;
  const repo = process.env.REPO_NAME;
  const path = "data.json";

  const octokit = new Octokit({ auth: token });

  try {
    // Obtenemos el SHA actual del archivo si existe
    let sha;
    try {
      const response = await octokit.request("GET /repos/{owner}/{repo}/contents/{path}", {
        owner,
        repo,
        path,
      });
      sha = response.data.sha;
    } catch (error) {
      if (error.status !== 404) {
        throw error;
      }
      // El archivo no existe aún; lo crearemos sin SHA
    }

    const content = Buffer.from(event.body).toString("base64");

    const commitMessage = "Actualizar data.json desde formulario web";

    // Guardamos el nuevo contenido en el archivo data.json
    await octokit.request("PUT /repos/{owner}/{repo}/contents/{path}", {
      owner,
      repo,
      path,
      message: commitMessage,
      content,
      sha, // si no hay SHA, GitHub creará el archivo
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ mensaje: "Guardado correctamente" }),
    };
  } catch (error) {
    console.error("Error al guardar datos:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
