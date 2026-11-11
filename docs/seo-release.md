# Shepard Croft SEO release checklist

- Source of truth: original Figma copy and visible services; avoid fabricated addresses, opening hours, ratings or health claims.
- Site exposes normal crawlable HTML pages at /, /living/, /wealth/, /heritage/, /companion/, /transfer/, /accessible/, /grocery/, /grocery-form/, /vending/, /vending-form/, /contact/.
- Each page has unique title, meta description, canonical, OpenGraph, Twitter, Organization, WebSite, BreadcrumbList, and relevant Service structured data.
- A build-time snapshot provides text and internal links before JavaScript, with React replacing the snapshot after load.
- API, admin and private 'ready' view must never be indexed.
- Preview and unapproved releases are NOINDEX by default. Set SEO_INDEXABLE=true only on the approved production deployment with SEO_SITE_URL set to its final canonical host.
- Submit https://<live-host>/sitemap.xml to Google Search Console and Bing Webmaster Tools once live. Verify Google Business Profile only after accurate business details have been provided.
- Run `npm run build`, `npm run seo:audit`, Lighthouse/PageSpeed mobile and desktop, Search Console URL Inspection and Rich Results Test before launch. Use live HTTPS pages for Search Console validation.
- AI Search: no special AI schema is required by Google; ensure crawlable pages, structured factual service content and proper indexing (https://developers.google.com/search/docs/appearance/ai-features). Optional llms.txt is informational only.
- VoxelBooking admin is an external PHP/MySQL service accessed at <backend>/admin; /admin on the React host redirects only after the backend origin is configured.