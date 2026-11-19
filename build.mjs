import { build } from 'esbuild';
import { copyFile, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';

const fontDir = new URL('./node_modules/@fontsource-variable/montserrat/', import.meta.url);
const [fontCSS, fontLicense, threeLicense, template, output] = await Promise.all([
  readFile(new URL('index.css', fontDir), 'utf8'),
  readFile(new URL('LICENSE', fontDir), 'utf8'),
  readFile('THREE-LICENSE.txt', 'utf8'),
  readFile('index.template.html', 'utf8'),
  build({entryPoints:['app.js'],bundle:true,format:'iife',minify:true,write:false}),
]);

// Embed the Latin and Ukrainian Cyrillic font subsets for local presentations.
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

const slots = {overview:'session-overview',play:'session-in-play',prop:'game-material',cover:'vartovi-cover',page:'vartovi-page',comic:'educational-comic',games:'board-games',vr:'vr-game',teen:'teen-session',youth:'youth-session',adult:'adult-session'};
const found = new Set(await readdir('media'));
const images = {};
await rm('dist/media',{recursive:true,force:true});
await mkdir('dist/media',{recursive:true});
for(const [slot,stem] of Object.entries(slots)){
  const name=['jpg','jpeg','png','webp'].map(ext=>stem+'.'+ext).find(file=>found.has(file));
  if(!name)continue;
  images[slot]='media/'+name;
  await copyFile('media/'+name,'dist/'+images[slot]);
}
const contactInput = JSON.parse(await readFile('media/contact.json','utf8'));
const get = key => typeof contactInput[key]==='string'?contactInput[key].trim():'';
const contact={email:get('email'),phone:get('phone'),url:get('url')};
if(contact.url && !/^https?:\/\//i.test(contact.url))throw new Error('Use an HTTP(S) URL for the contact link.');
const config=JSON.stringify({images,contact}).replace(/</g,'\\u003c');
const script = output.outputFiles[0].text.replace(/<\/script/gi,'<\\/script');
const html = template
  .replace('/* EMBEDDED_FONTS */', () => '/*\n' + fontLicense + '\n' + threeLicense + '\n*/\n' + faces.join('\n'))
  .replace('/* DECK_STYLES */', await readFile('style.css','utf8'))
  .replace('/* MEDIA_CONFIG */', () => config)
  .replace('/* APP_BUNDLE */', () => script);
await writeFile('dist/index.html',html);
