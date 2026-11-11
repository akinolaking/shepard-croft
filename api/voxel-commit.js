import {getVoxelConfig,commitApprovedBooking} from '../src/lib/voxel-booking-client.js';
export default async function handler(req,res){
 res.setHeader('Cache-Control','no-store');
 if(req.method!=='POST')return res.status(405).json({error:'method_not_allowed'});
 let config;try{config=getVoxelConfig(process.env);}catch{return res.status(503).json({error:'booking_not_configured'});}
 const origin=req.headers?.origin;
 if(origin){try{if(new URL(origin).host!==req.headers.host)return res.status(403).json({error:'origin_not_allowed'});}catch{return res.status(403).json({error:'origin_not_allowed'});}}
 const body=req.body;
 if(!body||typeof body!=='object'||JSON.stringify(body).length>4096)return res.status(400).json({error:'invalid_request'});
 try{
  const result=await commitApprovedBooking(config,{previewHandle:body.previewHandle,continuation:body.continuation,idempotencyKey:body.idempotencyKey,approvalConfirmed:body.approvalConfirmed});
  return res.status(200).json({status:'voxel_result',data:result.voxelResponse});
 }catch(e){return res.status(e.message==='customer_review_required'?422:503).json({error:e.message||'temporarily_unavailable'});}
}