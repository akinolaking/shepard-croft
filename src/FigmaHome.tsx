const companionshipImage='/images/companionship.webp';
import {useState} from 'react';

/**
 * Exact-layout reconstruction of the 1280px Figma desktop homepage frame.
 * Astryx Theme surrounds this component in App; custom semantic components
 * preserve design fidelity where generic component defaults would differ.
 * Other site pages retain their existing implementation and are not approved.
 */
const nav = [
  ['Living & Well-Being','living'],
  ['Wealth & Infrastructure','wealth'],
  ['Heritage & Provisions','heritage']
] as const;
const categories=[
 {number:'01',title:'Living & Well-Being',description:'Company and practical help at home, and journeys for people who need accessible transport.',items:[['Companion service','Request a companion','companion',false],['Accessible transport','Register interest','accessible',true]] as const},
 {number:'02',title:'Wealth & Infrastructure',description:'Reliable transfers for individuals and businesses, to and from airports and between sites.',items:[['Executive airport transfers','Request a quote','transfer',false],['Business and fleet transport','Talk to the team','contact',false]] as const},
 {number:'03',title:'Heritage & Provisions',description:'Everyday provisions: a grocery market to shop, sell or deliver, and vending machines on your site.',items:[['Grocery market','Shop, sell or deliver','grocery',false],['Vending machines','Request a site visit','vending',false]] as const}
];
const journeys=[
 {category:'LIVING & WELL-BEING', title:'Request a companion',description:'Company and practical help: errands, video calls, diary organisation, drop-off and pick-up.',bullets:['Who the help is for','Where, and what help is needed','How often and when','Your contact details'],action:'Request a companion',route:'companion'},
 {category:'WEALTH & INFRASTRUCTURE', title:'Request an airport transfer quote',description:'Manchester, Liverpool, Leeds Bradford, or any UK airport on request. A quote is not a confirmed booking.',bullets:['Pickup and destination','Date, time and passengers','Luggage and flight number','Whether it is a business enquiry'],action:'Request a quote',route:'transfer'},
 {category:'HERITAGE & PROVISIONS', title:'Request a vending site visit',description:'Tell us about your site and we will arrange a visit to talk through what would work there.',bullets:['Type of site and location','Roughly how many people pass','Your contact details'],action:'Request a site visit',route:'vending'}
];
function Action({label,route,light=false}:{label:string;route:string;light?:boolean}){
 return <a className={`fh-button${light?' fh-button-light':''}`} href={`/${route}/`}>{label}<span aria-hidden="true">→</span></a>
}
export default function FigmaHome(){
 const [menuOpen,setMenuOpen]=useState(false);
 return <div className="figma-site">
  <header className="fh-header"><div className="fh-wrap fh-nav">
   <a href="/" className="fh-brand">Shepard Croft</a>
   <nav className="fh-links" aria-label="Main navigation">{nav.map(([name,route])=><a key={route} href={`/${route}/`}>{name}</a>)}</nav>
   <a className="fh-nav-cta" href="/contact/">Talk to the team</a>
   <button type="button" className="fh-menu-toggle" aria-label="Open menu" aria-expanded={menuOpen} aria-controls="fh-mobile-nav" onClick={()=>setMenuOpen(!menuOpen)}>Menu</button>
  </div><nav className={`fh-mobile-nav${menuOpen?' open':''}`} id="fh-mobile-nav" aria-label="Mobile navigation">{nav.map(([name,route])=><a key={route} href={`/${route}/`} onClick={()=>setMenuOpen(false)}>{name}</a>)}<a href="/contact/" onClick={()=>setMenuOpen(false)}>Talk to the team</a></nav></header>
  <main id="content" className="fh-main">
   <section className="fh-first"><div className="fh-wrap">
    <div className="fh-hero"><div className="fh-hero-copy"><div className="fh-eyebrow">NORTH WEST ENGLAND</div>
     <h1>Your journeys, your errands,<br/>your home and your day,<br/>looked after by people who<br/>know you by name.</h1>
     <p>Companionship, airport and business transfers, groceries and<br className="fh-desktop-break"/> vending machines, arranged by a small team across the North<br className="fh-desktop-break"/> West.</p>
     <div className="fh-hero-actions"><Action label="Explore services" route="living"/><a href="/contact/" className="fh-text-link">Talk to the team<span aria-hidden="true">→</span></a></div>
    </div><img className="fh-hero-image" src={companionshipImage} alt="Two women enjoying tea together at home"/></div>
    <div className="fh-services"><div className="fh-eyebrow">WHERE TO START</div><h2>Three ways in, depending on what you need</h2>
     <div className="fh-service-grid">{categories.map(c=><article className="fh-service-card" key={c.number}><div className="fh-card-num">{c.number}</div><h3>{c.title}</h3><p>{c.description}</p><div className="fh-card-entries">{c.items.map(([name,action,route,coming])=><div key={route} className="fh-card-entry"><div className="fh-entry-title"><strong>{name}</strong>{coming?<span className="fh-coming">Coming soon</span>:null}</div><a href={`/${route}/`}>{action}<span aria-hidden="true">→</span></a></div>)}</div></article>)}</div>
    </div></div></section>
   <section className="fh-standard"><div className="fh-wrap fh-standard-grid"><div><div className="fh-eyebrow">OUR STANDARD</div><h2>A named person, a clear<br/>arrangement, a contact<br/>you can reach.</h2></div>
    <div className="fh-standard-points"><div><h3>Named people</h3><p>Every request is picked up by a person on the team, and you are told<br/>who will be helping you.</p></div><div><h3>Clear arrangements</h3><p>Time, place, what is included and what is not, agreed with you before<br/>anything starts.</p></div><div><h3>A contact you can reach</h3><p>One route back to a person: an email address today, and WhatsApp<br/>when the line opens.</p></div></div>
   </div></section>
   <section className="fh-journey-steps"><div className="fh-wrap"><div className="fh-journeys"><div className="fh-eyebrow">FEATURED JOURNEYS</div><h2>Start with what you need</h2><div className="fh-journey-grid">
    {journeys.map(j=><article className="fh-journey" key={j.route}><div className="fh-eyebrow">{j.category}</div><h3>{j.title}</h3><p>{j.description}</p><strong className="fh-questions-label">What we will ask</strong><ul>{j.bullets.map(t=><li key={t}>{t}</li>)}</ul><Action label={j.action} route={j.route}/></article>)}
    </div></div>
    <div className="fh-how"><div className="fh-eyebrow">HOW IT WORKS</div><h2>Ask, agree the details, receive</h2><div className="fh-step-grid">{[
     ['1','Ask','Tell us what you need through the form or by email. You do not need an account.'],
     ['2','Agree the details','We reply with the name of the person arranging it, the details and, where relevant, a quote.'],
     ['3','Receive','We confirm the arrangement with you before it begins, and tell you first if anything changes.']
    ].map(([n,t,d])=><div className="fh-step" key={n}><div className="fh-step-count"><span>{n}</span><i/></div><h3>{t}</h3><p>{d}</p></div>)}</div></div>
   </div></section>
   <section className="fh-contact"><div className="fh-wrap fh-contact-grid"><div><div className="fh-eyebrow">CONTACT</div><h2>Talk to a person.</h2><p>Write to us at <a href="mailto:Hello@shepardcroft.com">Hello@shepardcroft.com</a>. A WhatsApp line<br/>will be added here when it opens.</p><Action label="Send an enquiry" route="contact" light/></div><div className="fh-contact-topics"><strong>What is it about?</strong><div className="fh-topics">{['Companionship','Airport and business transfers','Accessible transport','Grocery market','Vending machines','Something else'].map(t=><span key={t}>{t}</span>)}</div></div></div></section>
  </main>
  <footer className="fh-footer"><div className="fh-wrap"><div className="fh-footer-grid"><div><a className="fh-footer-brand" href="/">Shepard Croft</a><p>Everyday help, arranged by people who<br/>know you by name.</p></div><div><strong>Living & Well-Being</strong><a href="/companion/">Companion service</a><a href="/accessible/">Accessible transport<br/>(coming soon)</a></div><div><strong>Wealth & Infrastructure</strong><a href="/transfer/">Executive transfers</a><a href="/wealth/">Business and fleet transport</a></div><div><strong>Heritage & Provisions</strong><a href="/grocery/">Grocery market</a><a href="/vending/">Vending machines</a></div><div><strong>Contact</strong><a href="mailto:Hello@shepardcroft.com">Hello@shepardcroft.com</a></div></div><div className="fh-footer-bottom">© Shepard Croft Limited · North West England</div></div></footer>
 </div>
}