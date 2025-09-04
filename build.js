
const fs = require('fs');
const path = require('path');
const nunjucks = require('nunjucks');

const TEMPLATES_DIR = path.join(__dirname, 'templates');
const DIST_DIR = path.join(__dirname, 'dist');
const STATIC_DIR = path.join(__dirname, 'static');

nunjucks.configure(TEMPLATES_DIR, { autoescape: false });

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}


function copyStatic(src, dest) {
  if (!fs.existsSync(src)) return;
  ensureDir(dest);
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (let entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyStatic(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

async function build() {
  ensureDir(DIST_DIR);
  copyStatic(STATIC_DIR, DIST_DIR);

  const pages = ['index', 'about', 'contact'];
  for (const p of pages) {
    const templateName = `pages/${p}.njk`;
    const outPath = path.join(DIST_DIR, `${p}.html`);
    const title = p === 'index' ? 'Home - MySite' : `${p[0].toUpperCase() + p.slice(1)} - MySite`;
    const html = nunjucks.render(templateName, { title });
    fs.writeFileSync(outPath, html);
    console.log('Built:', outPath);
  }
  console.log('\nBuild finished. Open dist/index.html in your browser.');
}

build().catch(err => {
  console.error(err);
  process.exit(1);
});
 
