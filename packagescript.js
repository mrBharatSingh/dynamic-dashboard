const fs = require("fs");
const path = require("path");

// ===== CONFIG =====
const projectRoot = __dirname;
const distFolder = path.join(projectRoot, "dist/dashboard");
const sourceHtml = path.join(distFolder, "index.html");
const outputHtml = path.join(projectRoot, "index.html");

// ===== HELPERS =====
function readFileSafe(filePath) {
  try {
    return fs.readFileSync(filePath, "utf8");
  } catch (err) {
    console.error(`❌ Failed to read: ${filePath}`);
    process.exit(1);
  }
}

function escapeScript(content) {
  return content.replace(/<\/script>/gi, "<\\/script>");
}

// ===== MAIN FUNCTION =====
function createSingleHtml() {
  console.log("🚀 Creating single HTML for GitHub Pages...\n");

  let html = readFileSafe(sourceHtml);

  const runtime = escapeScript(
    readFileSafe(path.join(distFolder, "runtime.js"))
  );
  const polyfills = escapeScript(
    readFileSafe(path.join(distFolder, "polyfills.js"))
  );
  const main = escapeScript(
    readFileSafe(path.join(distFolder, "main.js"))
  );
  const styles = readFileSafe(
    path.join(distFolder, "styles.css")
  );

  // Remove original script & link tags
  html = html.replace(/<script.*runtime\.js.*><\/script>/g, "");
  html = html.replace(/<script.*polyfills\.js.*><\/script>/g, "");
  html = html.replace(/<script.*main\.js.*><\/script>/g, "");
  html = html.replace(/<link.*styles\.css.*>/g, "");

  // Inline CSS
  html = html.replace(
    "</head>",
    `<style>\n${styles}\n</style>\n</head>`
  );

  // Inline JS (order matters!)
  const inlineScripts = `
<script type="module">
${runtime}
</script>

<script type="module">
${polyfills}
</script>

<script type="module">
${main}
</script>
`;

  html = html.replace("</body>", `${inlineScripts}\n</body>`);

  // Write to project root
  fs.writeFileSync(outputHtml, html);

  console.log("✅ Single index.html created at project root.");
  console.log("🌍 Ready to push to GitHub Pages.");
}

createSingleHtml();
