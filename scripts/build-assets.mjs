import fs from 'node:fs';
import path from 'node:path';
const src=path.resolve('src/image-data');
const dest=path.resolve('public/images');
fs.mkdirSync(dest,{recursive:true});
for(const name of ['grocery','airport-vehicle','companion-portrait','vending','community','companionship','front-door']){
  const content=fs.readFileSync(path.join(src,name+'.ts'),'utf8');
  const match=/data:image\/webp;base64,([A-Za-z0-9+/=]+)/.exec(content);
  if(!match)throw Error('Missing original asset '+name);
  const raw=Buffer.from(match[1],'base64');
  if(raw.subarray(0,4).toString()!=='RIFF')throw Error('Invalid WebP asset '+name);
  fs.writeFileSync(path.join(dest,name+'.webp'),raw);
}
console.log('Prepared 7 original Shepard Croft photos as separately cacheable WebP assets');