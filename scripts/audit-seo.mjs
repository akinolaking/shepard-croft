import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {SEO_PAGES} from '../seo-pages.mjs';
const dir=path.resolve('dist');
const failures=[];const record=(ok,label)=>{if(!ok)failures.push(label)};
const seen=new Set();
for(const page of SEO_PAGES){
 const file=path.join(dir,page.slug,'index.html');const exists=fs.existsSync(file);record(exists,'Missing page '+page.route);if(!exists)continue;
 const html=fs.readFileSync(file,'utf8');
 for(const [field,rx] of [['title',/<title>[^<]{8,90}<\/title>/],['description',/<meta name="description" content="[^"]{30,}/],['canonical',/<link rel="canonical" href="https:\/\/[^\"]+"/],['og title',/<meta property="og:title"/],['og image',/<meta property="og:image"/],['JSON-LD',/<script type="application\/ld\+json">/],['crawlable text',/<main data-seo-snapshot="true">/],['heading',/<h1>/],['crawlable internal links',/<a href="\/[^"#]+\/"/]])record(rx.test(html),`Missing ${field} on ${page.route}`);
 const descriptions=html.match(/<meta name="description" content="([^"]+)"/)?.[1];record(descriptions===page.description,'Incorrect description on '+page.route);
 const canonical=html.match(/<link rel="canonical" href="([^"]+)"/)?.[1];record(!seen.has(canonical),'Duplicate canonical '+canonical);seen.add(canonical);
 try{const raw=html.match(/<script type="application\/ld\+json">([^<]+)<\/script>/)?.[1];const parsed=JSON.parse(raw);const graph=parsed['@graph'];record(Array.isArray(graph)&&graph.some(x=>x['@type']==='Organization')&&graph.some(x=>x['@type']==='BreadcrumbList'), 'Invalid JSON-LD on '+page.route);}catch(e){failures.push('Bad JSON-LD '+page.route+': '+e.message)}
}
for(const file of ['robots.txt','sitemap.xml','llms.txt','shepard-croft-social.jpg'])record(fs.existsSync(path.join(dir,file)),'Missing '+file);
const sitemap=fs.readFileSync(path.join(dir,'sitemap.xml'),'utf8');record((sitemap.match(/<url>/g)||[]).length===SEO_PAGES.length,'Sitemap count mismatch');
record(!sitemap.includes('/admin')&&!sitemap.includes('/ready/')&&!sitemap.includes('/book-companion/'),'Private routes leaked into sitemap');
record(fs.readFileSync(path.join(dir,'ready/index.html'),'utf8').includes('noindex,nofollow'),'Ready page not noindexed');
record(fs.readFileSync(path.join(dir,'book-companion/index.html'),'utf8').includes('noindex,nofollow'),'Booking page not noindexed');
if(failures.length){for(const f of failures)console.error('FAIL:',f);process.exitCode=1;} else console.log(`SEO audit passed: ${SEO_PAGES.length} pages, metadata, unique canonical, structured data, internal links, sitemap, robots, social image and private route exclusion.`);