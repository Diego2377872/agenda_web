const { Octokit } = require("@octokit/core");

exports.handler = async function (event, context) {
  // Solo aceptar POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Método no permitido' }),
      headers: corsHeaders()
    };
  }

  const token = process.env.GITHUB_TOKEN;
  const owner = process.env.REPO_OWNER;
  const repo = process.env.REPO_NAME;
  const branch = process.env.REPO_BRANCH || 'main';

  // Verificación de variables de entorno
  if (!token || !owner || !repo) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Faltan variables de entorno requeridas.' }),
      headers: corsHeaders()
    };
  }

  let data;
  try {
    data = JSON.parse(event.body);
  } catch (parseError) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'JSON inválido en el cuerpo de la solicitud.' }),
      headers: corsHeaders()
    };
  }

  const octokit = new Octokit({ auth: token });

  const path = "data.json";
  let sha;

  try {
    // Obtener el SHA actual del archivo
    const getResponse = await octokit.request("GET /repos/{owner}/{repo}/contents/{path}", {
      owner,
      repo,
      path,
      ref: branch
    });
    sha = getResponse.data.sha;
  } catch (err) {
    if (err.status === 404) {
      // El archivo aún no existe, se creará
      sha = null;
    } else {
      return {
        statusCode: err.status || 500,
        body: JSON.stringify({ error: "Error al obtener el archivo actual.", details: err.message }),
        headers: corsHeaders()
      };
    }
  }

  try {
    const encodedContent = Buffer.from(JSON.stringify(data, null, 2)).toString("base64");

    const updateResponse = await octokit.request("PUT /repos/{owner}/{repo}/contents/{path}", {
      owner,
      repo,
      path,
      message: "Actualización de data.json vía Netlify",
      content: encodedContent,
      sha,
      branch
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, commit: updateResponse.data.commit.sha }),
      headers: corsHeaders()
    };
  } catch (error) {
    console.error("Error al guardar en GitHub:", error);
    return {
      statusCode: error.status || 500,
      body: JSON.stringify({
        error: error.message,
        details: error.response?.data || null
      }),
      headers: corsHeaders()
    };
  }
};

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };
}
