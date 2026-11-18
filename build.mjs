import { build } from 'esbuild';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
const o = await build({entryPoints:['app.js'],bundle:true,format:'iife',minify:true,write:false,legalComments:'inline'});
const template = await readFile('index.template.html','utf8');
const script = o.outputFiles[0].text.replace(/<\/script/gi,'<\\/script');
const html = template.replace('/* APP_BUNDLE */',()=>script);
await mkdir('dist',{recursive:true});
await writeFile('dist/index.html',html);
