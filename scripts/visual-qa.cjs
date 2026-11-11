/**
 * Screen-by-screen UI QA for Shepard Croft. Requires `npm run build` and Playwright's Chromium.
 * Captures full-page + 4x4 first-fold contact sheets at desktop/mobile, checks desktop/tablet/mobile.
 * Does not exercise real VoxelBooking or insert customer data.
 */
const fs = require('node:fs');
const path = require('node:path');
const {spawn} = require('node:child_process');
const {chromium} = require('playwright');
const output = path.resolve('qa');
const imageDir = path.join(output, 'screenshots');
const routes = ['home','living','wealth','heritage','companion','transfer','accessible','grocery','grocery-form','vending','vending-form','contact','book-companion'];
const viewports = [{name:'desktop',width:1440,height:900},{name:'tablet',width:768,height:1024},{name:'mobile',width:390,height:844}];
const base = 'http://127.0.0.1:4173';
const sleep = ms => new Promise(r=>setTimeout(r,ms));

async function waitForServer() {
 for(let retry=0;retry<50;retry++){
  try {const r=await fetch(base+'/');if(r.ok)return;} catch {}
  await sleep(250);
 }
 throw new Error('Vite preview did not start');
}

async function run(){
 fs.mkdirSync(imageDir,{recursive:true});
 const server=spawn(process.execPath,['./node_modules/vite/bin/vite.js','preview','--host','127.0.0.1','--port','4173'],{stdio:'ignore'});
 let browser;
 try{
  await waitForServer();
  browser=await chromium.launch({headless:true,args:['--no-sandbox']});
  const records=[];
  for(const viewport of viewports){
   const page=await browser.newPage({viewport:{width:viewport.width,height:viewport.height},deviceScaleFactor:1});
   const errors=[];
   page.on('pageerror',e=>errors.push(e.message));
   for(const route of routes){
    const url=base+(route==='home'?'/':`/${route}/`);
    await page.goto(url,{waitUntil:'domcontentloaded'});
    await page.waitForTimeout(100);
    if(viewport.name!=='tablet'){
     await page.screenshot({path:path.join(imageDir,`${viewport.name}-${route}-first.png`),animations:'disabled'});
     await page.screenshot({path:path.join(imageDir,`${viewport.name}-${route}-full.png`),fullPage:true,animations:'disabled'});
    }
    const data=await page.evaluate(()=>{
     const seen=el=>{const s=getComputedStyle(el),r=el.getBoundingClientRect();return r.width>1&&r.height>1&&s.display!=='none'&&s.visibility!=='hidden'&&Number(s.opacity)>0;};
     const parseColor=str=>{const m=str.match(/rgba?\(([^)]+)\)/);return m?m[1].split(/[,\s/]+/).filter(Boolean).map(Number):null;};
     const bg=el=>{let p=el;while(p){const c=parseColor(getComputedStyle(p).backgroundColor);if(c&&(c.length===3||c[3]>.1))return c;p=p.parentElement;}return [255,255,255];};
     const luminance=c=>c.slice(0,3).reduce((sum,n,i)=>{let v=n/255;return sum+[.2126,.7152,.0722][i]*(v<=.04045?v/12.92:Math.pow((v+.055)/1.055,2.4));},0);
     const contrast=(a,b)=>{const x=luminance(a),y=luminance(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);};
     const textAlerts=[];
     for(const el of document.querySelectorAll('h1,h2,h3,h4,label,legend')){
      if(!seen(el))continue;const fg=parseColor(getComputedStyle(el).color),b=bg(el);if(!fg)continue;const ratio=contrast(fg,b);
      if(ratio<4.5)textAlerts.push({tag:el.tagName,text:el.textContent.trim().slice(0,64),ratio:Number(ratio.toFixed(2)),fg:getComputedStyle(el).color,bg:b.join(',')});
     }
     const controls=Array.from(document.querySelectorAll('.form-card input:not([type=radio]):not([type=checkbox]),.form-card textarea,.form-card select')).filter(seen).map(el=>{
      const cs=getComputedStyle(el);return {tag:el.tagName,type:el.getAttribute('type')||'text',radius:cs.borderRadius,height:Math.round(el.getBoundingClientRect().height),color:cs.color,border:cs.borderColor};
     });
     return {
      h1:Array.from(document.querySelectorAll('h1')).map(el=>el.textContent.trim()),
      missingImages:Array.from(document.images).filter(i=>i.loading!=='lazy'&&(!i.complete||i.naturalWidth<1)).map(i=>i.getAttribute('src')),
      overflow:document.documentElement.scrollWidth-innerWidth,
      textAlerts,controls
     };
    });
    records.push({viewport:viewport.name,route,errors:errors.splice(0),...data});
    console.log(`${viewport.name}/${route}: ${data.textAlerts.length} text warnings, ${data.controls.length} fields, overflow ${data.overflow}`);
   }
   await page.close();
  }
  fs.writeFileSync(path.join(output,'audit.json'),JSON.stringify(records,null,2));
  const shots=routes.concat(['companion','transfer','contact']);
  for(const viewport of viewports.filter(x=>x.name!=='tablet')){
   const w=viewport.name==='desktop'?350:204,h=viewport.name==='desktop'?219:440;
   const figures=shots.map((route,index)=>{
    const data=fs.readFileSync(path.join(imageDir,`${viewport.name}-${route}-first.png`)).toString('base64');
    return `<figure><img src="data:image/png;base64,${data}"/><figcaption>${String(index+1).padStart(2,'0')} ${route.toUpperCase()}${index>=13?' · FORM DETAIL':''}</figcaption></figure>`;
   }).join('');
   const sheet=await browser.newPage({viewport:{width:4*(w+14)+12,height:4*(h+43+14)+12}});
   await sheet.setContent(`<!doctype html><meta charset="utf-8"><style>*{box-sizing:border-box}body{margin:0;background:#edf2ed;font:13px Arial}.grid{display:grid;grid-template-columns:repeat(4,${w}px);gap:14px;padding:12px}figure{width:${w}px;margin:0;background:#fff}img{width:${w}px;height:${h}px;object-fit:cover;object-position:top;display:block}figcaption{height:43px;padding:12px 8px;color:#244735;font-weight:bold}</style><main class="grid">${figures}</main>`,{waitUntil:'domcontentloaded',timeout:60000});
   await sheet.screenshot({path:path.join(output,`Shepard-Croft-${viewport.name}-4x4.png`),fullPage:true});
   await sheet.close();
  }
  const fail=records.filter(r=>r.errors.length||r.missingImages.length||r.overflow>1||r.textAlerts.length||r.controls.some(c=>parseFloat(c.radius)<6||c.height<44));
  fs.writeFileSync(path.join(output,'summary.json'),JSON.stringify({routes:routes.length,viewports:viewports.map(v=>v.name),totalChecks:records.length,failed:fail.length,failures:fail.map(x=>({viewport:x.viewport,route:x.route,errors:x.errors,text:x.textAlerts,controls:x.controls.filter(c=>parseFloat(c.radius)<6||c.height<44)}))},null,2));
  if(fail.length){console.error('Visual QA failure on '+fail.length+' route/viewport cases; see qa/summary.json');process.exitCode=1;}
  else console.log(`Visual QA passed: ${records.length} route/viewports. Evidence in ${output}`);
 } finally {await browser?.close();server.kill('SIGTERM');}
}
run().catch(err=>{console.error(err);process.exitCode=1});