// Shepard Croft's public /admin shortcut. Never proxy staff credentials through Vercel.
export default function handler(req,res){
  res.setHeader('Cache-Control','private, no-store, max-age=0');
  res.setHeader('X-Robots-Tag','noindex, nofollow, noarchive');
  if(req.method!=='GET'&&req.method!=='HEAD')return res.status(405).json({error:'method_not_allowed'});
  const configured=String(process.env.VOXELBOOKING_BASE_URL||'');
  let backend;
  try{backend=new URL(configured);}catch{return res.status(503).json({error:'booking_admin_not_configured'});}
  if(backend.protocol!=='https:'||backend.username||backend.password||backend.search||backend.hash||backend.pathname!=='/'){
    return res.status(503).json({error:'booking_admin_not_configured'});
  }
  return res.redirect(302,`${backend.origin}/admin`);
}