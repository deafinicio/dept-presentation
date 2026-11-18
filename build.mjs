import { build } from 'esbuild';
import { readFile, mkdir, writeFile } from 'node:fs/promises';

const fontDir = new URL('./node_modules/@fontsource-variable/montserrat/', import.meta.url);
const [fontCSS, fontLicense, template, output] = await Promise.all([
  readFile(new URL('index.css', fontDir), 'utf8'),
  readFile(new URL('LICENSE', fontDir), 'utf8'),
  readFile('index.template.html', 'utf8'),
  build({entryPoints:['app.js'],bundle:true,format:'iife',minify:true,write:false,legalComments:'inline'}),
]);

// Keep the presentation in a single HTML file, including the offline font.
const faces = await Promise.all([...fontCSS.matchAll(/@font-face\s*\{[^}]*\}/g)]
  .filter(([face]) => /\/montserrat-(latin|cyrillic)-wght-normal\.woff2/.test(face))
  .map(async ([face]) => {
    const [src, path] = face.match(/url\((\.\/[^)]+)\)\s*format\('[^']+'\)/);
    const font = await readFile(new URL(path, fontDir));
    return face
      .replace("'Montserrat Variable'", "'Montserrat'")
      .replace(src, "url(data:font/woff2;base64," + font.toString('base64') + ") format('woff2')");
  }));
if (faces.length !== 2) throw new Error('Montserrat Latin and Cyrillic subsets are required.');
const script = output.outputFiles[0].text.replace(/<\/script/gi,'<\\/script');
const html = template
  .replace('/* EMBEDDED_FONTS */', () => '/*\n' + fontLicense + '\n*/\n' + faces.join('\n'))
  .replace('/* APP_BUNDLE */', () => script);
await mkdir('dist',{recursive:true});
await writeFile('dist/index.html',html);
