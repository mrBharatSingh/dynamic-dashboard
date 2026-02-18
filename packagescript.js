const fs = require("fs");
const path = require("path");

// ===== CONFIG =====
const distFolder = path.join(__dirname, "dist/dashboard");
const htmlFile = path.join(distFolder, "index.html");

// ===== HELPERS =====
function readFileSafe(filePath) {
  try {
    return fs.readFileSync(filePath, "utf8");
  } catch (err) {
    console.error(`❌ Failed to read: ${filePath}`);
    return "";
  }
}

function escapeScript(content) {
  return content.replace(/<\/script>/gi, "<\\/script>");
}

// ===== INLINE FUNCTION =====
function inlineAngularBuild() {
  console.log("🚀 Creating single HTML bundle...\n");

  let html = readFileSafe(htmlFile);
  if (!html) {
    console.error("❌ index.html not found");
    return;
  }

  const runtimePath = path.join(distFolder, "runtime.js");
  const polyfillsPath = path.join(distFolder, "polyfills.js");
  const mainPath = path.join(distFolder, "main.js");
  const stylesPath = path.join(distFolder, "styles.css");

  const runtime = escapeScript(readFileSafe(runtimePath));
  const polyfills = escapeScript(readFileSafe(polyfillsPath));
  const main = escapeScript(readFileSafe(mainPath));
  const styles = readFileSafe(stylesPath);

  // ===== REMOVE EXISTING TAGS =====
  html = html.replace(/<script.*runtime\.js.*><\/script>/g, "");
  html = html.replace(/<script.*polyfills\.js.*><\/script>/g, "");
  html = html.replace(/<script.*main\.js.*><\/script>/g, "");
  html = html.replace(/<link.*styles\.css.*>/g, "");

  // ===== INLINE CSS =====
  if (styles) {
    html = html.replace(
      "</head>",
      `<style>\n${styles}\n</style>\n</head>`
    );
    console.log("✅ Inlined styles.css");
  }

  // ===== INLINE JS (ORDER MATTERS) =====
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

  // ===== WRITE FILE =====
  const outputPath = path.join(distFolder, "single-index.html");
  fs.writeFileSync(outputPath, html);

  console.log("\n🎉 SUCCESS!");
  console.log("📄 File created:");
  console.log(outputPath);
  console.log("\nYou can now open this file directly in browser.");
}

// ===== RUN =====
inlineAngularBuild();
