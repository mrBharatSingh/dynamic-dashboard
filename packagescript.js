const fs = require('fs');
const path = require('path');

// Replace with your actual paths
const htmlFile = 'dist\\dashboard\\index.html';
const scriptFolder = 'dist\\dashboard';

function readFile(path) {
  try {
    const content = fs.readFileSync(path, 'utf8');
    console.log(`Successfully read file: ${path}`);
    return content;
  } catch (error) {
    console.error(`Error reading file ${path}: ${error}`);
    return null;
  }
}

function inlineScripts(html, scriptFolder) {
  try {
    const scriptFiles = fs.readdirSync(scriptFolder);
    scriptFiles.forEach(file => {
      if (path.extname(file) === '.js') {
        const scriptPath = path.join(scriptFolder, file);
       
        const scriptContent = readFile(scriptPath);
        if (scriptContent) {
          const scriptTag = `<script>${scriptContent}</script>`;
          html = html.replace(`<script src="${file}" type="module"></script>`, scriptTag);
        } else {
          console.error(`Script content is null for file: ${scriptPath}`);
        }
      }
      if (path.extname(file) === '.css') {
        const scriptPath = path.join(scriptFolder, file);
        
        const scriptContent = readFile(scriptPath);
        if (scriptContent) {
          const scriptTag = `<style>${scriptContent}</style><noscript><style>${scriptContent}</style></noscript>`;
          html = html.replace(`<link rel="stylesheet" href="${file}" media="print" onload="this.media='all'"><noscript><link rel="stylesheet" href="${file}"></noscript>`, scriptTag);
        } else {
          console.error(`Script content is null for file: ${scriptPath}`);
        }
      }
    });
    return html;
  } catch (error) {
    console.error(`Error reading script folder ${scriptFolder}: ${error}`);
    return html;
  }
}

const htmlContent = readFile(htmlFile);
if (htmlContent) {
  const updatedHtml = inlineScripts(htmlContent, scriptFolder);
  if (updatedHtml) {
    fs.writeFileSync(htmlFile, updatedHtml);
    console.log('Scripts inlined successfully!');
  } else {
    console.error('Failed to inline scripts.');
  }
} else {
  console.error(`HTML content is null for file: ${htmlFile}`);
}
