import {validateBookingRequest} from './booking-request.js';
/** Dependency injected for deterministic contract tests. */
export async function receiveEnquiry(payload,{store}){
 const validation=validateBookingRequest(payload);
 if(!validation.ok)return {httpStatus:422,body:{error:'invalid_request',fields:validation.errors}};
 try{
   const saved=await store(validation.value);
   if(!saved?.id)throw new Error('missing_request_id');
   return {httpStatus:201,body:{status:'enquiry_received',requestId:String(saved.id)}};
 }catch{return {httpStatus:503,body:{error:'temporarily_unavailable'}};}
}