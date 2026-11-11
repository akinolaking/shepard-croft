const groceryImage='/images/grocery.webp';
const airportvehicleImage='/images/airport-vehicle.webp';
const companionportraitImage='/images/companion-portrait.webp';
const vendingImage='/images/vending.webp';
const communityImage='/images/community.webp';
const companionshipImage='/images/companionship.webp';
const frontdoorImage='/images/front-door.webp';
import FigmaHome from './FigmaHome';
import {buildEnquiryPayload, submitEnquiry} from './lib/enquiry-client.js';
import {useEffect,useState} from 'react';
import {Theme} from '@astryxdesign/core/theme';
import {neutralTheme} from '@astryxdesign/theme-neutral/built';
import {Button} from '@astryxdesign/core/Button';
import {TextInput} from '@astryxdesign/core/TextInput';

/**
 * Shepard Croft website — React 19 + actual Astryx 0.7.4 primitives.
 * Project references: Figma-exported PDF/SVG supplied by the owner and
 * astryx-main.zip. Enquiry forms call a guarded server-only API. Booking creation requires the
 * configured external VoxelBooking service and customer approval.
 */

type Route = 'book-companion'|'home'|'living'|'wealth'|'heritage'|'companion'|'transfer'|'accessible'|'grocery'|'grocery-form'|'vending'|'vending-form'|'contact'|'ready';
type Draft = {subject:string;body:string;mode:'sent'|'draft';requestId?:string};
const E='Hello@shepardcroft.com';
const routeNames:Record<Route,string>={'book-companion':'Book a companion',home:'Home',living:'Living & Well-Being',wealth:'Wealth & Infrastructure',heritage:'Heritage & Provisions',companion:'Companion request',transfer:'Airport transfer quote',accessible:'Accessible transport',grocery:'Grocery market', 'grocery-form':'Grocery market interest', vending:'Vending machines','vending-form':'Vending site visit',contact:'Contact',ready:'Enquiry draft'};
const routeList=Object.keys(routeNames) as Route[];
const currentRoute=():Route=>{const legacy=location.hash.match(/^#\/?([a-z-]+)$/);const value=(legacy?legacy[1]:location.pathname.replace(/^\/+|\/+$/g,'')) as Route;return routeList.includes(value)?value:'home'};
function go(route:Route){history.pushState(null,'',route==='home'?'/':`/${route}/`);window.dispatchEvent(new PopStateEvent('popstate'));}
function Link({route,children,outline=false,className=''}:{route:Route;children:React.ReactNode;outline?:boolean;className?:string}){return <a className={`btn ${outline?'btn--outline':''} ${className}`} href={route==='home'?'/':`/${route}/`}>{children}<span aria-hidden="true">→</span></a>}
function Eyebrow({children}:{children:React.ReactNode}){return <div className="eyebrow">{children}</div>}
const imageByName:Record<string,string>={'grocery':groceryImage,'airport-vehicle':airportvehicleImage,'companion-portrait':companionportraitImage,'vending':vendingImage,'community':communityImage,'companionship':companionshipImage,'front-door':frontdoorImage};
function Image({name,alt}:{name:string;alt:string}){return <img src={imageByName[name]} alt={alt} loading="lazy"/>}
const offerings=[
 {num:'01',title:'Living & Well-Being',description:'Company and practical help at home, and journeys for people who need accessible transport.',items:[['Companion service','companion'],['Accessible transport (coming soon)','accessible']] as [string,Route][]},
 {num:'02',title:'Wealth & Infrastructure',description:'Reliable transfers for individuals and businesses, to and from airports and between sites.',items:[['Executive airport transfers','transfer'],['Business & fleet transport','contact']] as [string,Route][]},
 {num:'03',title:'Heritage & Provisions',description:'Everyday provisions: a grocery market to shop, sell or deliver, and vending machines on your site.',items:[['Grocery market','grocery'],['Vending machines','vending']] as [string,Route][]}
];
const details:{[key:string]:{eyebrow:string;title:string;desc:string;image:string;imageAlt:string;actions:[string,Route][]}}={
 living:{eyebrow:'Living & Well-Being / Companionship',title:'A trusted pair of hands for your week.',desc:'Companionship, errands and everyday help, shaped around the life you enjoy.',image:'front-door',imageAlt:'A companion visiting someone at their door',actions:[['Request a companion','companion'],['Accessible transport','accessible']]},
 wealth:{eyebrow:'Wealth & Infrastructure / Executive Travel',title:'Landed, met, and on your way.',desc:'A smooth arrival for you, your guests and your business. From the airport to wherever you need to be.',image:'companion-portrait',imageAlt:'Airport collection vehicle',actions:[['Request a quote','transfer'],['Business accounts','contact']]},
 heritage:{eyebrow:'Heritage & Provisions',title:'Everyday essentials, thoughtfully provided.',desc:'A grocery market where people can shop, sell or deliver, alongside managed vending for workplaces and venues.',image:'grocery',imageAlt:'Fresh produce at a grocery market',actions:[['Grocery market','grocery'],['Vending machines','vending']]},
 grocery:{eyebrow:'Heritage & Provisions / Grocery Market',title:'One market. Three ways to take part.',desc:'Shop, sell or deliver with the Shepard Croft grocery market. Opening dates are still to be confirmed.',image:'grocery',imageAlt:'Fresh vegetables at a market',actions:[['Register your interest','grocery-form']]},
 vending:{eyebrow:'Heritage & Provisions / Vending',title:'Good snacks and drinks, always stocked.',desc:'Modern vending for the places people spend their day.',image:'vending',imageAlt:'A vending machine in a workplace',actions:[['Request a site visit','vending-form']]}
};
type Field = {name:string;label:string;type?:'text'|'email'|'date'|'time'|'textarea'|'select'|'radio'|'checkbox';placeholder?:string;required?:boolean;options?:string[]};
const basicContact:Field[]=[
 {name:'your_name',label:'Your name',required:true,placeholder:'Full name'},
 {name:'reply_to',label:'Phone or email',required:true,placeholder:'How we can reach you'}
];
const formConfigs:Partial<Record<Route,{category:string;title:string;description:string;noteTitle:string;note:string;type:string;fields:Field[]}>>={
 companion:{category:'Living & Well-Being',title:'Request a companion',description:'Tell us who the help is for and what would make the week easier. We’ll reply.',noteTitle:'What this service is',note:'Non-medical company and practical help for people who live independently: errands, video calls and technology help, diary organisation, drop-off and pick-up. No personal care, nursing or medical support.',type:'Companion service',fields:[
 {name:'request_for',label:'Who is this for?',type:'radio',required:true,options:['Myself','Someone else, such as a family member or friend']},
 {name:'their_name',label:'Their name (if applicable)',placeholder:'Full name'},
 {name:'area',label:'Town or postcode',placeholder:'Where help is needed',required:true},
 {name:'help_needed',label:'What help is needed?',type:'checkbox',options:['Errands and shopping','Video calls and tech help','Diary organisation','Drop-off and pick-up','Something else']},
 {name:'when',label:'How often, and when?',type:'textarea',placeholder:'For example: Tuesday mornings, once a week'},...basicContact]},
 transfer:{category:'Wealth & Infrastructure',title:'Request an airport transfer quote',description:'Tell us about the journey. We’ll reply with the details and a quote.',noteTitle:'A quote is not a booking',note:'Manchester, Liverpool, Leeds Bradford, or other UK airports on request. The journey is not booked until arrangements are agreed.',type:'Transfer quotation',fields:[
 {name:'pickup',label:'Pickup location',required:true,placeholder:'Address, airport or postcode'},
 {name:'destination',label:'Destination',required:true,placeholder:'Address or postcode'},
 {name:'travel_date',label:'Travel date',type:'date',required:true},
 {name:'travel_time',label:'Pickup time',type:'time',required:true},
 {name:'passengers',label:'Passengers',type:'select',required:true,options:['1','2','3','4','5','6','7','8+']},
 {name:'luggage',label:'Luggage',type:'select',required:true,options:['Hand luggage only','1–2 cases','3–4 cases','5 or more cases']},
 {name:'flight',label:'Flight number (optional)'},
 {name:'journey_type',label:'Journey type',type:'select',required:true,options:['Airport arrival','Airport departure','Business transfer','Other']},
 {name:'business',label:'Is this a business enquiry?',type:'radio',options:['Yes','No']},
 {name:'notes',label:'Anything else we should know?',type:'textarea'},...basicContact]},
 accessible:{category:'Living & Well-Being / Coming soon',title:'Accessible transport: register your interest',description:'We are preparing an accessible transport service and are not taking bookings yet.',noteTitle:'Registering is not booking',note:'Tell us broad travel accessibility requirements, not medical details. This does not book or commit you to a journey.',type:'Accessible transport interest',fields:[
 {name:'traveller',label:'Who would be travelling?',type:'radio',required:true,options:['Myself','Someone I support']},
 {name:'access_needs',label:'Access needs',type:'checkbox',options:['Wheelchair user','Uses a walking aid','Help getting in and out','Travels with a carer','Something else']},
 {name:'area',label:'Area you would travel in',required:true,placeholder:'Town or postcode'},...basicContact]},
 'grocery-form':{category:'Heritage & Provisions',title:'Grocery market: register your interest',description:'Choose whether you would like to shop, sell or deliver. We will be in touch as the market develops.',noteTitle:'Opening dates to be confirmed',note:'This is an interest enquiry, not an active shopping, selling or delivery account.',type:'Grocery market interest',fields:[
 {name:'role',label:'I am interested in',required:true,type:'radio',options:['Shopping','Selling','Delivering']},
 {name:'area',label:'Your area',required:true,placeholder:'Town or postcode'},
 {name:'notes',label:'Tell us more (optional)',type:'textarea'},...basicContact]},
 'vending-form':{category:'Heritage & Provisions',title:'Request a vending site visit',description:'Tell us about your site and we will arrange a conversation about what would work there.',noteTitle:'A visit is a conversation',note:'There is no commitment. We look at the space, footfall and what your visitors would want.',type:'Vending site visit',fields:[
 {name:'site_type',label:'Type of site',required:true,type:'select',options:['Workplace / office','Gym / leisure venue','School / college','Residential building','Community venue','Other']},
 {name:'site_location',label:'Site location',required:true,placeholder:'Address or postcode'},
 {name:'footfall',label:'Approximate daily footfall (optional)',placeholder:'Estimate'},
 {name:'organisation',label:'Organisation name (optional)'},...basicContact]},
 contact:{category:'Contact',title:'Talk to the team',description:'Tell us a little about what you need and a person will be able to respond.',noteTitle:'A route to a person',note:`Email us directly at ${E}. The supplied design has no published WhatsApp number or opening hours.`,type:'General enquiry',fields:[
 {name:'subject',label:'What is it about?',type:'select',required:true,options:['Companionship','Accessible transport','Airport & business transfers','Grocery market','Vending machines','Something else']},
 {name:'message',label:'What would you like to ask?',required:true,type:'textarea'},...basicContact]}
};
function Navigation({route}:{route:Route}){
 const [open,setOpen]=useState(false);
 useEffect(()=>setOpen(false),[route]);
 const active=route==='companion'||route==='accessible'?'living':route==='transfer'?'wealth':route==='grocery'||route==='vending'||route==='vending-form'||route==='grocery-form'?'heritage':route;
 return <header className="topbar"><div className="container nav-inner">
  <a className="brand" href="/">Shepard Croft<span>Here for your everyday</span></a>
  <nav className="nav-links" aria-label="Main navigation">{(['living','wealth','heritage'] as Route[]).map(r=><a aria-current={active===r?'page':undefined} href={`/${r}/`} key={r}>{routeNames[r]}</a>)}</nav>
  <Link route="contact" className="nav-cta">Talk to the team</Link>
  <button className="menu-toggle" type="button" aria-label="Toggle menu" aria-expanded={open} onClick={()=>setOpen(v=>!v)}>☰</button>
 </div><nav className={'mobile-menu '+(open?'open':'')} aria-label="Mobile navigation">{(['living','wealth','heritage','companion','transfer','contact'] as Route[]).map(r=><a href={`/${r}/`} key={r}>{routeNames[r]}</a>)}</nav></header>;
}
function Footer(){return <footer className="footer"><div className="container"><div className="footer-main"><div><a className="brand" href="/">Shepard Croft</a><p className="footer-about">Everyday help, arranged by people who know you by name.</p></div>
 {([['Living & Well-Being',['companion','accessible']],['Wealth & Infrastructure',['transfer','wealth']],['Heritage & Provisions',['grocery','vending']],['Contact',['contact']]] as [string,Route[]][]).map(([title,rs])=><div key={title} className="footer-col"><div className="footer-head">{title}</div>{rs.map(r=><a href={`/${r}/`} key={r}>{routeNames[r]}</a>)}</div>)}
 </div><div className="footer-bottom">© {new Date().getFullYear()} Shepard Croft Limited · North West England <a href={`mailto:${E}`}>{E}</a></div></div></footer>}
function Offerings(){return <div className="service-grid">{offerings.map(s=><article className="service-card" key={s.num}><div className="card-no">{s.num}</div><h3>{s.title}</h3><p>{s.description}</p><ul className="service-list">{s.items.map(([label,r])=><li key={label}><span>{label}</span><a href={`/${r}/`}>Explore →</a></li>)}</ul></article>)}</div>}
function Standard(){return <section className="section standard"><div className="container standard-grid"><div><Eyebrow>Our standard</Eyebrow><h2>A named person, a clear arrangement, a contact you can reach.</h2></div><div className="standard-copy">{[['Named people','Every request is picked up by a person on the team, and you are told who will be helping you.'],['Clear arrangements','Time, place, what is included and what is not, agreed with you before anything starts.'],['A contact you can reach','One route back to a person: an email address today, and WhatsApp when the line opens.']].map(([t,p])=><div key={t} className="standard-item"><h3>{t}</h3><p>{p}</p></div>)}</div></div></section>}
function HowItWorks(){return <section className="section"><div className="container"><Eyebrow>How it works</Eyebrow><h2>Ask, agree the details, receive.</h2><div className="step-grid">{[['01','Ask','Tell us what you need through the form or by email. No account needed.'],['02','Agree the details','We reply with the name of the person arranging it, the details and, where relevant, a quote.'],['03','Receive','We confirm the arrangement before it begins and tell you if anything changes.']].map(([n,t,p])=><div className="step" key={n}><div className="step-no">{n}</div><h3>{t}</h3><p>{p}</p></div>)}</div></div></section>}
function ContactBand(){return <section className="cta-dark"><div className="container contact-strip"><div><Eyebrow>Contact</Eyebrow><h2>Talk to a person.</h2><p className="lead">Write to us at <a style={{color:'white',textDecoration:'underline'}} href={`mailto:${E}`}>{E}</a>. A WhatsApp line will be added when it opens.</p><Link route="contact">Send an enquiry</Link></div><div className="contact-options">{['Companionship','Accessible transport','Airport & business transfers','Grocery market','Vending machines','Something else'].map(s=><div key={s} className="contact-choice">✓ {s}</div>)}</div></div></section>}
function Home(){return <><section className="hero"><div className="container hero-grid"><div className="hero-copy"><Eyebrow>North West England</Eyebrow><h1>Your journeys, your errands, your home and your day, looked after by people who know you by name.</h1><p className="lead">Companionship, airport and business transfers, groceries and vending machines, arranged by a small team across the North West.</p><div className="btn-group"><Link route="living">Explore services</Link><Link route="contact" outline>Talk to the team</Link></div></div><div className="hero-art"><Image name="companionship" alt="Two women talking over tea at home"/></div></div></section>
 <section className="section-tight"><div className="container"><div className="section-head"><div><Eyebrow>Where to start</Eyebrow><h2>Three ways in, depending on what you need.</h2></div></div><Offerings/></div></section>
 <Standard/><section className="section"><div className="container"><Eyebrow>Featured journeys</Eyebrow><h2>Start with what you need.</h2><div className="journey-grid">{[
 ['Living & Well-Being','Request a companion','Company and practical help: errands, video calls, diary organisation, drop-off and pick-up.','companion'],
 ['Wealth & Infrastructure','Airport transfer quote','Manchester, Liverpool, Leeds Bradford, or any UK airport on request.','transfer'],
 ['Heritage & Provisions','Vending site visit','Tell us about your site and we will arrange a visit to talk through what could work.','vending-form']
 ].map(([tag,t,p,r])=><article className="journey" key={t}><Eyebrow>{tag}</Eyebrow><h3>{t}</h3><p>{p}</p><div className="what">Ask, agree, receive</div><p>We will discuss your needs and respond personally.</p><Link route={r as Route} outline>Make an enquiry</Link></article>)}</div></div></section><HowItWorks/><ContactBand/></>}
function Marketing({route}:{route:Route}){const p=details[route];if(!p)return null;
 return <><section className="page-hero"><div className="container"><div className="breadcrumb"><a href="/">Home</a> / {routeNames[route]}</div><div className="page-hero-grid"><div><Eyebrow>{p.eyebrow}</Eyebrow><h1>{p.title}</h1><p className="lead">{p.desc}</p><div className="btn-group">{p.actions.map(([label,r],i)=><Link route={r} outline={i>0} key={r}>{label}</Link>)}</div></div><div className="page-hero-media"><Image name={p.image} alt={p.imageAlt}/></div></div></div></section>
 {route==='living'?<><section className="service-detail"><div className="container detail-grid"><div><Eyebrow>Here for your everyday</Eyebrow><h2>A little help. More room for life.</h2><p className="lead">A walk, a conversation or the practical things that need doing. Your companion helps you live independently, your way.</p><div className="detail-points">{['Good conversation','Practical help','Technology support','A familiar face'].map(t=><div className="detail-point" key={t}><strong>{t}</strong></div>)}</div></div><div className="feature-image"><Image name="community" alt="Two people browsing books together"/></div></div></section><HowItWorks/></>:null}
 {route==='wealth'?<section className="service-detail"><div className="container detail-grid"><div><Eyebrow>A better arrival</Eyebrow><h2>From landing to the last mile, we take care of the details.</h2><p className="lead">Meet and greet, luggage assistance, business travel, and other transfers by arrangement. Manchester, Liverpool and Leeds Bradford; other UK airports on request.</p><div className="detail-points">{['Flight tracking','Meet & greet','Door to door','Business travel'].map(t=><div className="detail-point" key={t}><strong>{t}</strong></div>)}</div></div><div className="feature-image"><Image name="airport-vehicle" alt="Travel plans laid out on a table"/></div></div></section>:null}
 {route==='heritage'?<section className="section"><div className="container"><Eyebrow>Two useful ways to serve</Eyebrow><h2>Provisions for homes, workplaces and communities.</h2><div className="service-grid"><article className="service-card"><h3>A market for everyone.</h3><p>Shop, sell and deliver through a shared grocery market.</p><Link route="grocery">Explore grocery market</Link></article><article className="service-card"><h3>Good snacks and drinks, always stocked.</h3><p>Managed vending for offices, gyms and venues.</p><Link route="vending">Explore vending</Link></article><article className="service-card"><h3>Talk to a person.</h3><p>Not sure which service fits? We can help.</p><Link route="contact">Get in touch</Link></article></div></div></section>:null}
 {route==='grocery'?<section className="section"><div className="container"><Eyebrow>Choose your role</Eyebrow><h2>Shop. Sell. Deliver.</h2><div className="market-grid">{[['Shop','Order groceries delivered to your door when the market opens.'],['Sell','List products on the vendor app, under terms agreed with each vendor.'],['Deliver','Bring orders to customers in your area and be paid for each drop.']].map(([t,p])=><article key={t} className="market-card"><h3>{t}</h3><p>{p}</p><Link route="grocery-form">Register interest</Link></article>)}</div></div></section>:null}
 {route==='vending'?<section className="section"><div className="container"><Eyebrow>Workplaces / gyms / schools / venues</Eyebrow><h2>You choose the range. We take care of the rest.</h2><div className="benefits-grid">{['Placement, rental or purchase options','Regular restocking, cleaning and maintenance','Card and contactless payment','A product range chosen with you','Healthier choices alongside favourites','Support by agreed arrangement'].map(t=><article className="benefit" key={t}><h3>{t}</h3></article>)}</div></div></section>:null}
 <section className="statement"><div className="container"><Eyebrow>Next step</Eyebrow><h2>Let’s make a plan.</h2><p className="lead">Tell us what you need and we will reply to discuss the details.</p><Link route={p.actions[0][1]}>Make an enquiry</Link></div></section></>;
}
function FormRoute({route,onDraft}:{route:Route;onDraft:(d:Draft)=>void}){
 const cfg=formConfigs[route];const [values,setValues]=useState<Record<string,string>>({});
 const [formError,setFormError]=useState('');
 const [privacyAcknowledged,setPrivacyAcknowledged]=useState(false);
 const [submitting,setSubmitting]=useState(false);
 if(!cfg)return null;
 const update=(key:string,value:string)=>setValues(old=>({...old,[key]:value}));
 const submit=async(e:React.FormEvent<HTMLFormElement>)=>{
   e.preventDefault();if(submitting)return;
   const form=e.currentTarget;if(!form.reportValidity())return;
   const missing=cfg.fields.filter(field=>field.required&&!values[field.name]?.trim());
   if(missing.length){setFormError('Please complete: '+missing.map(f=>f.label).join(', '));return;}
   if(!privacyAcknowledged){setFormError('Please read and acknowledge the privacy information.');return;}
   setFormError('');setSubmitting(true);
   const keys=cfg.fields.filter(f=>values[f.name]!==undefined&&values[f.name]!==''),
     body=['Hello Shepard Croft team,','','I would like to enquire about '+cfg.type+'.','',
       ...keys.map(f=>`${f.label}: ${values[f.name]}`),'','Kind regards,',values.your_name||''].join('\n');
   const subject=`Shepard Croft — ${cfg.type} enquiry`;
   const result=await submitEnquiry(buildEnquiryPayload(route,values,privacyAcknowledged));
   setSubmitting(false);
   if(result.ok){onDraft({subject,body,mode:'sent',requestId:result.requestId});go('ready');}
   else {setFormError((result.error||'Nothing has been sent.')+' You can prepare an email draft instead.');
         onDraft({subject,body,mode:'draft'});}
 };
 const control=(field:Field)=>{
 const type=field.type??'text';const val=values[field.name]??'';
 if(type==='textarea')return <textarea name={field.name} id={field.name} value={val} placeholder={field.placeholder} required={field.required} onChange={e=>update(field.name,e.target.value)}/>;
 if(type==='select')return <select id={field.name} name={field.name} value={val} required={field.required} onChange={e=>update(field.name,e.target.value)}><option value="">Choose an option</option>{field.options?.map(o=><option key={o}>{o}</option>)}</select>;
 if(type==='radio'||type==='checkbox')return <div className="options">{field.options?.map(opt=><label key={opt}><input type={type} name={field.name} value={opt} checked={type==='radio'?val===opt:val.split(' | ').includes(opt)} required={type==='radio'?field.required:undefined} onChange={e=>{if(type==='radio')update(field.name,opt);else {const set=new Set(val?val.split(' | '):[]);e.target.checked?set.add(opt):set.delete(opt);update(field.name,[...set].join(' | '));}}}/>{opt}</label>)}</div>;
 if(type==='text'||type==='email')return <TextInput label={field.label} placeholder={field.placeholder} value={val} isRequired={field.required} onChange={v=>update(field.name,v)}/>;
 return <input type={type} id={field.name} name={field.name} value={val} required={field.required} onChange={e=>update(field.name,e.target.value)}/>;
 };
 return <section className="form-page"><div className="container"><div className="breadcrumb"><a href="/">Home</a> / {cfg.category} / {cfg.title}</div><div className="form-page-grid"><div className="form-description"><Eyebrow>{cfg.category}</Eyebrow><h1>{cfg.title}</h1><p className="lead">{cfg.description}</p><aside className="info-panel"><h3>{cfg.noteTitle}</h3><p>{cfg.note}</p></aside></div>
 <div className="form-card"><form onSubmit={submit}><h2>Your request</h2>{formError?<p className="form-validation show" role="alert">{formError}</p>:null}{cfg.fields.map(field=><div className="field" key={field.name}>{field.type==='text'||!field.type?<>{control(field)}{field.required&&!values[field.name]?<small className="hint">Required</small>:null}</>:<><label htmlFor={field.name}><span>{field.label}{field.required?' *':''}</span></label>{control(field)}</>}</div>)}<label className="privacy-consent"><input type="checkbox" required checked={privacyAcknowledged} onChange={e=>setPrivacyAcknowledged(e.target.checked)}/><span>I have read the privacy information and agree that Shepard Croft may use these contact details to respond to my enquiry. No appointment is booked by this form.</span></label><div className="form-actions"><Button label={submitting?'Submitting…':'Send enquiry'} variant="primary" type="submit" isDisabled={submitting}/>{formError.includes('email draft instead')?<button type="button" className="btn btn--outline" onClick={()=>go('ready')}>Open email draft →</button>:null}</div><p className="privacy-note">Your request is an enquiry, not a booking. We do not send care or medical details to the online database.</p>{route==='companion'&&import.meta.env.VITE_VOXEL_BOOKING_LIVE==='true'?<Link route="book-companion" outline>Check appointment availability</Link>:null}</form></div></div></div></section>;
}

function CompanionBooking(){
  const [fields,setFields]=useState({name:'',email:'',date:'',time:''});
  const [review,setReview]=useState<{reviewUrl:string;previewHandle:string;continuation:string}|null>(null);
  const [approved,setApproved]=useState(false);
  const [result,setResult]=useState<Record<string,unknown>|null>(null);
  const [message,setMessage]=useState('');
  const [pending,setPending]=useState(false);
  const [key]=useState(()=>crypto.randomUUID());
  const [commitKey]=useState(()=>crypto.randomUUID());
  const update=(field:keyof typeof fields,value:string)=>setFields(prev=>({...prev,[field]:value}));
  const start=async(event:React.FormEvent<HTMLFormElement>)=>{
    event.preventDefault();setMessage('');setPending(true);
    try{
      const response=await fetch('/api/voxel-preview',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify({...fields,idempotencyKey:key})});
      const data=await response.json();
      if(!response.ok||data.status!=='review_required')throw new Error('Booking is currently unavailable. Contact the team instead.');
      if(typeof data.reviewUrl!=='string'||typeof data.previewHandle!=='string'||typeof data.continuation!=='string')throw new Error('The booking service did not return a valid review page.');
      const trusted=new URL(data.reviewUrl);if(trusted.protocol!=='https:')throw new Error('The booking review URL is not secure.');
      setReview(data);setApproved(false);
    }catch(e){setMessage(e instanceof Error?e.message:'The booking service is unavailable.');}
    finally{setPending(false);}
  };
  const complete=async()=>{
    if(!review||!approved||pending)return;
    setMessage('');setPending(true);
    try{
      const response=await fetch('/api/voxel-commit',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify({previewHandle:review.previewHandle,continuation:review.continuation,idempotencyKey:commitKey,approvalConfirmed:true})});
      const data=await response.json();
      if(!response.ok)throw new Error('Unable to complete the booking. Please check with the team before trying again.');
      setResult(data.data ?? {});
      setMessage('VoxelBooking has returned a booking result. Check the status and receipt below.');
    }catch(e){setMessage(e instanceof Error?e.message:'Booking could not be completed.');}
    finally{setPending(false);}
  };
  return <section className="form-page"><div className="container"><div className="breadcrumb"><a href="/">Home</a> / Living &amp; Well-Being / Book a companion</div><div className="form-page-grid"><div className="form-description"><Eyebrow>Living &amp; Well-Being</Eyebrow><h1>Arrange a companion appointment</h1><p className="lead">Choose a date and time, then review all booking details and give consent on the trusted booking page before you commit.</p><aside className="info-panel"><h3>Booking is separate from enquiries</h3><p>The booking service only accepts slots it confirms as available. Do not enter medical details. Your appointment is not confirmed until VoxelBooking returns a confirmation status and receipt.</p></aside><Link route="companion" outline>Make an enquiry instead</Link></div><div className="form-card"><h2>Check an appointment</h2><form onSubmit={start}>
   <div className="field"><label htmlFor="book-name">Your full name</label><input id="book-name" required value={fields.name} onChange={e=>update('name',e.target.value)} minLength={2} maxLength={120}/></div>
   <div className="field"><label htmlFor="book-email">Your email</label><input id="book-email" type="email" required value={fields.email} onChange={e=>update('email',e.target.value)}/></div>
   <div className="field"><label htmlFor="book-date">Appointment date</label><input id="book-date" type="date" required value={fields.date} onChange={e=>update('date',e.target.value)}/></div>
   <div className="field"><label htmlFor="book-time">Appointment time</label><input id="book-time" type="time" required value={fields.time} onChange={e=>update('time',e.target.value)}/></div>
   <Button label={pending?'Working…':'Prepare booking review'} type="submit" variant="primary" isDisabled={pending||!!review}/>
   </form>
   {review?<div className="info-panel"><h3>Review and approve</h3><p>Open the trusted review page, verify the date, service, price and business, and personally approve any required consent. Then return here.</p><p><a href={review.reviewUrl} target="_blank" rel="noopener noreferrer">Open secure booking review →</a></p><label className="privacy-consent"><input type="checkbox" checked={approved} onChange={e=>setApproved(e.target.checked)}/><span>I reviewed and personally approved the proposal on VoxelBooking.</span></label><button type="button" className="btn" disabled={!approved||pending||!!result} onClick={complete}>Commit approved booking</button></div>:null}
   {message?<p role="status">{message}</p>:null}{result?<div role="status"><h3>Booking service response</h3><p>Status: {String(result.status||'not provided')}</p>{result.booking_id?<p>Booking reference: {String(result.booking_id)}</p>:null}<p>Check your VoxelBooking receipt or contact the team if the status is not confirmed. Do not submit a duplicate request.</p></div>:null}
  </div></div></div></section>;
}

function Ready({draft}:{draft:Draft|null}){
 const [copied,setCopied]=useState(false);
 if(!draft)return <section className="ready-hero"><div className="container"><h1>No enquiry prepared yet.</h1><Link route="home">Return home</Link></div></section>;
 const link=`mailto:${E}?subject=${encodeURIComponent(draft.subject)}&body=${encodeURIComponent(draft.body)}`;
 return <section className="ready-hero"><div className="container"><div className="ready-card">
   <Eyebrow>{draft.mode==='sent'?'Enquiry received':'Email draft'}</Eyebrow>
   <h1>{draft.mode==='sent'?'We have received your enquiry.':'Your enquiry is ready to email.'}</h1>
   {draft.mode==='sent'?<p role="status">Your enquiry has been recorded. Reference: <strong>{draft.requestId}</strong>. This is <strong>not</strong> a confirmed booking or availability hold.</p>:
     <p><strong>Nothing has been sent.</strong> Open your email app and send the draft, or copy it below.</p>}
   {draft.mode==='draft'?<><pre className="ready-data">{draft.body}</pre><div className="ready-actions"><a className="btn" href={link}>Open email app →</a><button className="btn btn--outline" type="button" onClick={()=>{navigator.clipboard.writeText(draft.subject+'\n\n'+draft.body).then(()=>setCopied(true)).catch(()=>setCopied(false))}}>{copied?'Copied':'Copy enquiry'}</button></div></>:null}
   <div className="ready-actions"><Link route="home">Return home</Link></div>
 </div></div></section>;
}
export default function App(){
 const [route,setRoute]=useState<Route>(currentRoute);
 const [draft,setDraft]=useState<Draft|null>(null);
 useEffect(()=>{const update=()=>{setRoute(currentRoute());window.scrollTo(0,0)};addEventListener('popstate',update);addEventListener('hashchange',update);return()=>{removeEventListener('popstate',update);removeEventListener('hashchange',update)}},[]);
 useEffect(()=>{document.title=route==='home'?'Shepard Croft | Companionship, Airport Transfers & Everyday Services':`${routeNames[route]} | Shepard Croft`},[route]);
 return <Theme theme={neutralTheme}>{route==='home'?<FigmaHome/>:<><a className="skip-link" href="#content">Skip to main content</a><Navigation route={route}/><main id="content">{details[route]?<Marketing route={route}/>:route==='ready'?<Ready draft={draft}/>:route==='book-companion'?<CompanionBooking/>:<FormRoute key={route} route={route} onDraft={setDraft}/>}</main><Footer/></>}</Theme>;
}