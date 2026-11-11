import fs from 'node:fs';
import path from 'node:path';
import {SEO_PAGES,SEO_ROUTE_MAP} from '../seo-pages.mjs';
import {SOCIAL_IMAGE_BASE64} from '../seo-social-image.mjs';
const dist=path.resolve('dist');
let template=fs.readFileSync(path.join(dist,'index.html'),'utf8');
// Idempotent if the SEO post-processor is executed twice on the same Vite output.
template=template.replace(/<!-- SC-SEO-BEGIN -->[\s\S]*?<!-- SC-SEO-END -->/,'').replace(/<div id="root"><main data-seo-snapshot="true">[\s\S]*?<\/main><\/div>/,'<div id="root"></div>');
fs.writeFileSync(path.join(dist,'shepard-croft-social.jpg'),Buffer.from(SOCIAL_IMAGE_BASE64,'base64'));
const canonicalOrigin=(process.env.SEO_SITE_URL||'https://shepard-croft.vercel.app').replace(/\/+$/,'');
if(!/^https:\/\/[a-z0-9.-]+(?::\d+)?$/i.test(canonicalOrigin))throw new Error('SEO_SITE_URL must be an HTTPS origin');
const indexable=process.env.SEO_INDEXABLE==='true'&&process.env.VERCEL_ENV!=='preview';
const esc=s=>String(s).replace(/[&"<>']/g,c=>({'&':'&amp;','"':'&quot;','<':'&lt;','>':'&gt;',"'":'&#39;'}[c]));
const orgId=`${canonicalOrigin}/#organization`;
const shared={ '@context':'https://schema.org', '@type':'Organization','@id':orgId,name:'Shepard Croft Limited',url:canonicalOrigin,description:'Companionship, practical help, business and airport transfers, groceries and vending in North West England.',email:'Hello@shepardcroft.com',areaServed:{'@type':'AdministrativeArea',name:'North West England'}};
const links=page=>page.links.map(r=>{const x=SEO_ROUTE_MAP[r];if(!x)return '';return `<li><a href="${x.slug?'/'+x.slug+'/':'/'}">${esc(x.heading)}</a></li>`}).join('');
const markup=page=>{
  const crumbs=[{'@type':'ListItem',position:1,name:'Home',item:canonicalOrigin+'/'}];
  if(page.route!=='home')crumbs.push({'@type':'ListItem',position:2,name:page.category,item:`${canonicalOrigin}/${page.slug}/`});
  const canonical=canonicalOrigin+(page.slug?'/'+page.slug+'/':'/');
  const graph=[shared,{'@context':'https://schema.org','@type':'WebSite','@id':canonicalOrigin+'/#website',name:'Shepard Croft',url:canonicalOrigin,inLanguage:'en-GB',publisher:{'@id':orgId}}, {'@context':'https://schema.org','@type':'WebPage','@id':canonical+'#webpage',url:canonical,name:page.title,description:page.description,isPartOf:{'@id':canonicalOrigin+'/#website'},about:{'@id':orgId},inLanguage:'en-GB'}, {'@context':'https://schema.org','@type':'BreadcrumbList',itemListElement:crumbs}];
  if(page.route!=='home'&&!['contact','grocery-form','vending-form'].includes(page.route))graph.push({'@context':'https://schema.org','@type':'Service',name:page.heading,serviceType:page.category,description:page.description,provider:{'@id':orgId},areaServed:{'@type':'AdministrativeArea',name:'North West England'},url:canonical});
  const head=`<meta name="description" content="${esc(page.description)}" />\n`+
  `<meta name="robots" content="${indexable?'index,follow,max-image-preview:large':'noindex,nofollow'}" />\n`+
  `<link rel="canonical" href="${esc(canonical)}" />\n`+
  `<meta property="og:type" content="website" /><meta property="og:site_name" content="Shepard Croft" /><meta property="og:locale" content="en_GB" />\n`+
  `<meta property="og:title" content="${esc(page.title)}" /><meta property="og:description" content="${esc(page.description)}" /><meta property="og:url" content="${esc(canonical)}" />\n`+
  `<meta property="og:image" content="${esc(canonicalOrigin+'/shepard-croft-social.jpg')}" /><meta name="twitter:card" content="summary_large_image" />\n`+
  `<meta name="twitter:title" content="${esc(page.title)}" /><meta name="twitter:description" content="${esc(page.description)}" />\n`+
  `<script type="application/ld+json">${JSON.stringify({'@context':'https://schema.org','@graph':graph.map(o=>{const {'@context':_ctx,...rest}=o;return rest;})}).replace(/</g,'\\u003c')}</script>`;
  const staticBody=`<div id="root"><main data-seo-snapshot="true"><header><a href="/">Shepard Croft</a><nav aria-label="Service navigation"><a href="/living/">Living &amp; Well-Being</a> <a href="/wealth/">Wealth &amp; Infrastructure</a> <a href="/heritage/">Heritage &amp; Provisions</a> <a href="/contact/">Contact</a></nav></header><article><p>${esc(page.category)}</p><h1>${esc(page.heading)}</h1>${page.copy.map(t=>`<p>${esc(t)}</p>`).join('')}<h2>More from Shepard Croft</h2><ul>${links(page)}</ul></article><footer><a href="mailto:Hello@shepardcroft.com">Hello@shepardcroft.com</a></footer></main></div>`;
  return template.replace(/<title>.*?<\/title>/s,`<title>${esc(page.title)}</title>`).replace('</head>',`<!-- SC-SEO-BEGIN -->${head}<!-- SC-SEO-END --></head>`).replace('<div id="root"></div>',staticBody);
};
for(const page of SEO_PAGES){const filepath=path.join(dist,page.slug,'index.html');fs.mkdirSync(path.dirname(filepath),{recursive:true});fs.writeFileSync(filepath,markup(page));}
fs.mkdirSync(path.join(dist,'ready'),{recursive:true});fs.writeFileSync(path.join(dist,'ready/index.html'),template.replace('</head>','<meta name="robots" content="noindex,nofollow" /></head>'));
fs.mkdirSync(path.join(dist,'book-companion'),{recursive:true});fs.writeFileSync(path.join(dist,'book-companion/index.html'),template.replace('<title>Shepard Croft</title>','<title>Book a Companion | Shepard Croft</title>').replace('</head>','<meta name="robots" content="noindex,nofollow" /></head>'));
const robots=indexable?'User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api/\nDisallow: /ready/\nDisallow: /book-companion/\n':'User-agent: *\nDisallow: /\n';
fs.writeFileSync(path.join(dist,'robots.txt'),robots+`Sitemap: ${canonicalOrigin}/sitemap.xml\n`);
fs.writeFileSync(path.join(dist,'sitemap.xml'),'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+SEO_PAGES.map(page=>`<url><loc>${esc(canonicalOrigin+(page.slug?'/'+page.slug+'/':'/'))}</loc></url>`).join('')+'</urlset>\n');
// This optional informational file is NOT a Google AI-search ranking or indexing requirement.
fs.writeFileSync(path.join(dist,'llms.txt'),`# Shepard Croft\n\nShepard Croft Limited serves North West England with non-medical companionship, practical help, airport and business transfers, grocery market participation and workplace vending.\n\n- Website: ${canonicalOrigin}/\n- Living & Well-Being: ${canonicalOrigin}/living/\n- Airport and business transfers: ${canonicalOrigin}/wealth/\n- Heritage & Provisions: ${canonicalOrigin}/heritage/\n- Contact: ${canonicalOrigin}/contact/\n\nAccessible transport is coming soon; interest forms are not bookings. Companionship does not include nursing, medical care or personal care. No enquiry or quote constitutes a confirmed booking.\n`);
console.log(`Created ${SEO_PAGES.length} SEO HTML routes, sitemap and robots.txt. Indexable=${indexable}`);