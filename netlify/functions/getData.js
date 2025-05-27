const { Octokit } = require("@octokit/rest");

exports.handler = async function () {
  const token = process.env.GH_TOKEN;
  const octokit = new Octokit({ auth: token });

  const repoOwner = "TU_USUARIO_GITHUB";
  const repoName = "NOMBRE_DEL_REPOSITORIO";
  const filePath = "data.json";
  const branch = "main";

  try {
    const { data: file } = await octokit.repos.getContent({
      owner: repoOwner,
      repo: repoName,
      path: filePath,
      ref: branch,
    });

    const content = Buffer.from(file.content, "base64").toString("utf8");

    return {
      statusCode: 200,
      body: content,
      headers: { "Content-Type": "application/json" },
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
