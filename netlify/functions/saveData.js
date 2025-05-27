const { Octokit } = require("@octokit/core");

exports.handler = async function (event, context) {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
      body: "Método no permitido",
    };
  }

  const token = process.env.GITHUB_TOKEN;
  const owner = process.env.REPO_OWNER;
  const repo = process.env.REPO_NAME;
  const path = "data.json";

  const octokit = new Octokit({ auth: token });

  try {
    // Obtener el SHA actual (si existe)
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
      // Si es 404, el archivo aún no existe: se creará
    }

    const content = Buffer.from(event.body).toString("base64");
    const message = "Actualizar data.json desde formulario web";

    await octokit.request("PUT /repos/{owner}/{repo}/contents/{path}", {
      owner,
      repo,
      path,
      message,
      content,
      ...(sha && { sha }) // solo incluir SHA si existe
    });

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({ mensaje: "Guardado correctamente" }),
    };
  } catch (error) {
    console.error("Error al guardar datos:", error.message);
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({ error: error.message }),
    };
  }
};

