const fs = require('fs').promises;
const path = require('path');

const srcRoot = path.resolve(__dirname, '..', 'public');
const destRoot = path.resolve(__dirname, '..', 'dist');

async function copyDir(src, dest) {
  await fs.mkdir(dest, { recursive: true });
  const entries = await fs.readdir(src, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name === '.DS_Store') continue;
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      await copyDir(srcPath, destPath);
    } else {
      await fs.copyFile(srcPath, destPath);
    }
  }
}

async function main() {
  try {
    await copyDir(srcRoot, destRoot);
    console.log('public/ assets copied to dist/');
    // Try to copy official FullCalendar CSS from node_modules if available
    const root = path.resolve(__dirname, '..');
    const candidates = [
      { pkg: '@fullcalendar/core', names: ['main.min.css', 'main.css'], out: 'fullcalendar-core.css' },
      { pkg: '@fullcalendar/daygrid', names: ['main.min.css', 'main.css'], out: 'fullcalendar-daygrid.css' }
    ];

    for (const c of candidates) {
      let found = false;
      for (const name of c.names) {
        const src = path.join(root, 'node_modules', c.pkg, name);
        try {
          await fs.access(src);
          const dest = path.join(destRoot, c.out);
          await fs.copyFile(src, dest);
          console.log(`Copied ${src} -> ${dest}`);
          found = true;
          break;
        } catch (err) {
          // not found, try next
        }
      }
      if (!found) {
        console.log(`Official CSS for ${c.pkg} not found in node_modules; keeping local placeholder.`);
      }
    }
  } catch (err) {
    console.error('Failed to copy public to dist:', err);
    process.exit(1);
  }
}

main();
