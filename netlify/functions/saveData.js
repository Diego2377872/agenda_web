const { Octokit } = require("@octokit/rest");

exports.handler = async function (event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const token = process.env.GH_TOKEN;
  const octokit = new Octokit({ 
    auth: token,
    userAgent: "netlify-function-v1",
    timeZone: "America/Asuncion"
  });

  const repoOwner = "Diego2377872";
  const repoName = "agenda_web";
  const filePath = "data.json";
  const branch = "main";

  try {
    const newData = JSON.parse(event.body);

    // Obtener contenido actual
    const { data: file } = await octokit.repos.getContent({
      owner: repoOwner,
      repo: repoName,
      path: filePath,
      ref: branch,
      headers: {
        "X-GitHub-Api-Version": "2022-11-28"
      }
    });

    const sha = file.sha;

    const updatedContent = Buffer.from(JSON.stringify(newData, null, 2)).toString("base64");

    // Guardar archivo actualizado
    await octokit.repos.createOrUpdateFileContents({
      owner: repoOwner,
      repo: repoName,
      path: filePath,
      message: "Actualizar data.json desde formulario",
      content: updatedContent,
      sha: sha,
      branch: branch,
      headers: {
        "X-GitHub-Api-Version": "2022-11-28"
      }
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Archivo actualizado correctamente" })
    };
  } catch (error) {
    console.error("Error en saveData:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: "Error al guardar datos",
        details: error.message 
      }),
      headers: { "Content-Type": "application/json" }
    };
  }
};
