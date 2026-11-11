import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const css=readFileSync(new URL('../src/styles.css',import.meta.url),'utf8');
const figmaCss=readFileSync(new URL('../src/figma-home.css',import.meta.url),'utf8');

test('QA: form field radius, dark label ink and consistent Astryx inputs are defined',()=>{
 assert.match(css,/--sc-field-radius:\s*8px/);
 assert.match(css,/--sc-field-ink:\s*#183a2d/);
 assert.match(css,/form-card\s+\.field\s+:where\(input:not\(\[type="checkbox"\]\)/);
 assert.match(css,/border-radius:var\(--sc-field-radius\)/);
 assert.match(css,/form-card\s+\.field\s+:where\(label/);
});
test('QA: light editorial surfaces enforce dark headings, dark panels retain white',()=>{
 assert.match(figmaCss,/\.figma-site \.fh-first :is\(h1,h2,h3\)/);
 assert.match(figmaCss,/\.figma-site \.fh-contact :is\(h2,h3,p,strong\)/);
 assert.match(css,/\.form-page :is\(h1,h2,h3,h4\)/);
});
test('QA: visible focus rings and reduced motion retained',()=>{
 assert.match(css,/:focus-visible/);
 assert.match(css,/@media \(prefers-reduced-motion: reduce\)/);
});