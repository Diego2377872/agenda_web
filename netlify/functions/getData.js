const { Octokit } = require("@octokit/core");

exports.handler = async function (event, context) {
  const token = process.env.GITHUB_TOKEN;
  const owner = process.env.REPO_OWNER;
  const repo = process.env.REPO_NAME;

  // Verifica que las variables de entorno estén configuradas
  if (!token || !owner || !repo) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Configuración faltante en variables de entorno" }),
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    };
  }

  const octokit = new Octokit({ auth: token });

  try {
    const response = await octokit.request("GET /repos/{owner}/{repo}/contents/data.json", {
      owner,
      repo
    });

    // Decodifica el contenido base64
    const content = Buffer.from(response.data.content, 'base64').toString('utf8');
    
    return {
      statusCode: 200,
      body: content,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    };
  } catch (error) {
    console.error("Error al obtener datos:", error);
    return {
      statusCode: error.status || 500,
      body: JSON.stringify({ 
        error: error.message,
        details: error.response?.data 
      }),
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    };
  }
};
