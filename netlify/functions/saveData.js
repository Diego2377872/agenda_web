const { Octokit } = require("@octokit/core");

exports.handler = async function (event, context) {
  const token = process.env.GITHUB_TOKEN;
  const owner = process.env.REPO_OWNER;
  const repo = process.env.REPO_NAME;
  const path = "data.json"; // ruta relativa en el repo

  if (!token || !owner || !repo) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Variables de entorno faltantes" }),
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    };
  }

  const octokit = new Octokit({ auth: token });

  let sha = "";
  try {
    const file = await octokit.request("GET /repos/{owner}/{repo}/contents/{path}", {
      owner,
      repo,
      path
    });
    sha = file.data.sha;
  } catch (error) {
    console.error("No se pudo obtener SHA:", error.message);
  }

  try {
    const body = JSON.parse(event.body);

    const response = await octokit.request("PUT /repos/{owner}/{repo}/contents/{path}", {
      owner,
      repo,
      path,
      message: "Actualizar data.json desde formulario web",
      content: Buffer.from(JSON.stringify(body, null, 2)).toString("base64"),
      sha: sha || undefined
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true }),
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    };
  } catch (error) {
    console.error("Error al guardar datos:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Error al guardar datos", details: error.message }),
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    };
  }
};
;

