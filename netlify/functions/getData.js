const { Octokit } = require("@octokit/core");

exports.handler = async function (event, context) {
  const token = process.env.GITHUB_TOKEN;
  const owner = process.env.REPO_OWNER;
  const repo = process.env.REPO_NAME;
  const path = "data.json"; // Ruta fija del archivo
  const branch = process.env.REPO_BRANCH || "main";

  if (!token || !owner || !repo) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Faltan variables de entorno: GITHUB_TOKEN, REPO_OWNER, REPO_NAME" }),
      headers: corsHeaders(),
    };
  }

  const octokit = new Octokit({ auth: token });

  try {
    const response = await octokit.request("GET /repos/{owner}/{repo}/contents/{path}", {
      owner,
      repo,
      path,
      ref: branch
    });

    const content = Buffer.from(response.data.content, 'base64').toString('utf8');

    return {
      statusCode: 200,
      body: content,
      headers: {
        ...corsHeaders(),
        'Content-Type': 'application/json'
      }
    };
  } catch (error) {
    console.error("Error al obtener datos de GitHub:", error.message);

    return {
      statusCode: error.status || 500,
      body: JSON.stringify({ 
        error: error.message,
        status: error.status,
        details: error.response?.data || null
      }),
      headers: corsHeaders()
    };
  }
};

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };
}
