import {neon} from '@neondatabase/serverless';
import {receiveEnquiry} from '../src/lib/enquiry-service.js';

const MAX_BODY_BYTES=16*1024;
const json=(res,status,body)=>res.status(status).json(body);
export default async function handler(req,res){
 res.setHeader('Cache-Control','no-store');
 res.setHeader('Content-Type','application/json; charset=utf-8');
 res.setHeader('X-Content-Type-Options','nosniff');
 if(req.method!=='POST'){res.setHeader('Allow','POST');return json(res,405,{error:'method_not_allowed'});}
 const origin=req.headers?.origin;
 if(origin){try{if(new URL(origin).host!==req.headers.host)return json(res,403,{error:'origin_not_allowed'});}catch{return json(res,403,{error:'origin_not_allowed'});}}
 // Production gate stays closed until privacy notice, abuse protection, schema and provider integration pass.
 if(process.env.SHPRD_BOOKING_REQUESTS_ENABLED!=='true')return json(res,503,{error:'enquiries_not_enabled'});
 let body=req.body;
 try{if(typeof body==='string')body=JSON.parse(body);
    if(Buffer.byteLength(JSON.stringify(body??null),'utf8')>MAX_BODY_BYTES)return json(res,413,{error:'payload_too_large'});
 }catch{return json(res,400,{error:'invalid_json'});}
 const dbUrl=process.env.SHPRD_DATABASE_URL;
 if(!dbUrl)return json(res,503,{error:'database_not_configured'});
 const sql=neon(dbUrl);
 const result=await receiveEnquiry(body,{store:async value=>{
   const rows=await sql`INSERT INTO public.booking_requests
      (request_type,full_name,email,phone,requested_date,requested_time)
      VALUES (${value.requestType},${value.fullName},${value.email},${value.phone},
              ${value.requestedDate},${value.requestedTime})
      RETURNING id`;
   return rows[0];
 }});
 return json(res,result.httpStatus,result.body);
}