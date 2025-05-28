const { Octokit } = require("@octokit/core");

exports.handler = async function (event, context) {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Método no permitido' }),
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    };
  }

  const token = process.env.GITHUB_TOKEN;
  const owner = process.env.REPO_OWNER;
  const repo = process.env.REPO_NAME;
  const data = JSON.parse(event.body);

  const octokit = new Octokit({ auth: token });

  try {
    // Primero obtén el SHA del archivo existente
    const getResponse = await octokit.request("GET /repos/{owner}/{repo}/contents/data.json", {
      owner,
      repo
    });

    // Actualiza el archivo
    const updateResponse = await octokit.request("PUT /repos/{owner}/{repo}/contents/data.json", {
      owner,
      repo,
      path: "data.json",
      message: "Actualización de datos via Netlify",
      content: Buffer.from(JSON.stringify(data, null, 2)).toString('base64'),
      sha: getResponse.data.sha
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
      statusCode: error.status || 500,
      body: JSON.stringify({ 
        error: error.message,
        details: error.response?.data 
      }),
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
