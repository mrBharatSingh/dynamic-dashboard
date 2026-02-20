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
    console.warn(`⚠️ Warning: Could not read ${filePath}. Skipping.`);
    return "";
  }
}

// Inline fonts/images into CSS, handling PrimeNG's query parameters
function inlineCssAssets(css, baseDir) {
  return css.replace(/url\((['"]?)(.*?)\1\)/g, (match, quotes, urlPath) => {
    if (urlPath.startsWith("data:") || urlPath.startsWith("http")) return match;

    // Fix for PrimeIcons: Strip out ?v=... or #iefix hashes from the URL
    const cleanPath = urlPath.split(/[?#]/)[0];
    const filePath = path.join(baseDir, cleanPath);

    if (fs.existsSync(filePath)) {
      const ext = path.extname(cleanPath).toLowerCase();
      const mimeTypes = {
        ".woff": "font/woff",
        ".woff2": "font/woff2",
        ".ttf": "font/ttf",
        ".eot": "application/vnd.ms-fontobject",
        ".svg": "image/svg+xml",
        ".png": "image/png",
        ".jpg": "image/jpeg",
        ".gif": "image/gif"
      };
      const mime = mimeTypes[ext] || "application/octet-stream";
      const fileData = fs.readFileSync(filePath);
      return `url("data:${mime};base64,${fileData.toString("base64")}")`;
    }
    return match;
  });
}

// ===== MAIN FUNCTION =====
function createSingleHtml() {
  console.log("🚀 Creating dynamic single HTML...\n");
  let html = readFileSafe(sourceHtml);

  // 1. Dynamically find and inline ALL CSS files
  const styleRegex = /<link[^>]*rel="stylesheet"[^>]*href="([^"]+)"[^>]*>/g;
  html = html.replace(styleRegex, (match, fileName) => {
    const filePath = path.join(distFolder, fileName);
    let cssContent = readFileSafe(filePath);
    cssContent = inlineCssAssets(cssContent, distFolder);
    // Using callback return prevents the $ character injection issue
    return `<style>\n${cssContent}\n</style>`;
  });

  // 2. Dynamically find and inline ALL JS files
  const scriptRegex = /<script[^>]*src="([^"]+)"[^>]*><\/script>/g;
  html = html.replace(scriptRegex, (match, fileName) => {
    const filePath = path.join(distFolder, fileName);
    let jsContent = readFileSafe(filePath);
    jsContent = jsContent.replace(/<\/script>/gi, "<\\/script>");
    return `<script type="module">\n${jsContent}\n</script>`;
  });

  // 3. Handle the Favicon
  const faviconPath = path.join(distFolder, "favicon.ico");
  html = html.replace(/<link[^>]*rel="icon"[^>]*>/gi, ""); // Strip existing
  
  if (fs.existsSync(faviconPath)) {
    const faviconData = fs.readFileSync(faviconPath).toString("base64");
    const faviconTag = `<link rel="icon" type="image/x-icon" href="data:image/x-icon;base64,${faviconData}">`;
    html = html.replace("</head>", () => `${faviconTag}\n</head>`);
  } else {
    html = html.replace("</head>", () => `<link rel="icon" href="data:,">\n</head>`);
  }

  // Write to project root
  fs.writeFileSync(outputHtml, html);

  console.log("✅ Single index.html created at project root.");
  console.log("🌍 All chunks and PrimeNG assets successfully bundled.");
}

createSingleHtml();