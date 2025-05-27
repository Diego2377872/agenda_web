const { Octokit } = require("@octokit/rest");

exports.handler = async function (event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const token = process.env.GH_TOKEN;
  const octokit = new Octokit({ auth: token });

  const repoOwner = "Diego2377872";
  const repoName = "agenda_web";
  const filePath = "data.json";
  const branch = "main";

  const newData = JSON.parse(event.body);

  try {
    const { data: file } = await octokit.repos.getContent({
      owner: repoOwner,
      repo: repoName,
      path: filePath,
      ref: branch,
    });

    const sha = file.sha;
    const updatedContent = Buffer.from(JSON.stringify(newData, null, 2)).toString("base64");

    await octokit.repos.createOrUpdateFileContents({
      owner: repoOwner,
      repo: repoName,
      path: filePath,
      message: "Actualizar data.json desde formulario",
      content: updatedContent,
      sha: sha,
      branch: branch,
    });

    return { statusCode: 200, body: "Archivo actualizado correctamente" };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify(error.message) };
  }
};
