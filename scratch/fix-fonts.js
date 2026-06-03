const fs = require('fs');
const path = require('path');

const dirPath = path.join(__dirname, '..', 'src', 'components', 'pages');
const blogPath = path.join(__dirname, '..', 'src', 'app', '[locale]', 'blog');

function processDir(dir) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.tsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      // Replacements
      content = content.replace(/text-5xl lg:text-6xl font-normal/g, 'text-3xl lg:text-4xl font-semibold');
      content = content.replace(/text-4xl font-normal/g, 'text-3xl font-semibold');
      content = content.replace(/text-4xl lg:text-5xl font-normal/g, 'text-3xl lg:text-4xl font-semibold');
      content = content.replace(/prose-lg/g, '');
      content = content.replace(/text-2xl font-normal/g, 'text-xl font-semibold');
      content = content.replace(/text-lg lg:text-xl/g, 'text-base');
      
      fs.writeFileSync(fullPath, content);
      console.log('Fixed', fullPath);
    }
  }
}

processDir(dirPath);
processDir(blogPath);
