import test from 'node:test';
import assert from 'node:assert/strict';
import {SEO_PAGES} from '../seo-pages.mjs';
test('all public SEO routes have unique slugs and descriptions',()=>{assert.equal(SEO_PAGES.length,12);assert.equal(new Set(SEO_PAGES.map(p=>p.slug)).size,12);assert.equal(new Set(SEO_PAGES.map(p=>p.title)).size,12);for(const page of SEO_PAGES){assert.ok(page.description.length>45);assert.ok(page.heading.length>8);assert.ok(page.copy.length>0)}});
test('no private or draft routes are included in sitemap source',()=>{assert.ok(!SEO_PAGES.some(p=>['admin','ready','book-companion'].includes(p.route)))});
test('promised services avoid medical-care claims and false booking status',()=>{const c=SEO_PAGES.find(p=>p.route==='companion');assert.match(c.copy.join(' '),/non-medical|not personal care/);assert.match(c.copy.join(' '),/not a confirmed appointment/)});