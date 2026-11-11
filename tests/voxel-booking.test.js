import test from 'node:test';
import assert from 'node:assert/strict';
import {getVoxelConfig,createBookingReview,commitApprovedBooking} from '../src/lib/voxel-booking-client.js';
const env={SHPRD_VOXELBOOKING_ENABLED:'true',VOXELBOOKING_BASE_URL:'https://booking.example.org',VOXELBOOKING_BUSINESS_SLUG:'shepard',VOXELBOOKING_SERVICE_ID:'svc_example'};
const config=getVoxelConfig(env);
const customer={name:'Taylor Example',email:'taylor@example.org',date:'2026-11-20',time:'09:30'};
test('requires HTTPS configuration and explicit enablement',()=>{
 assert.throws(()=>getVoxelConfig({...env,SHPRD_VOXELBOOKING_ENABLED:'false'}),/voxel_not_enabled/);
 assert.throws(()=>getVoxelConfig({...env,VOXELBOOKING_BASE_URL:'http://internal'}),/voxel_not_configured/);
});
test('preview performs session then review without creating an appointment',async()=>{
 const calls=[];
 const fetcher=async(url,options)=>{
  calls.push({url,options});
  if(url.endsWith('/session'))return {ok:true,json:async()=>({continuation:'continuation-session-token'})};
  return {ok:true,json:async()=>({preview_handle:'preview-handle-token',review_url:'https://booking.example.org/review/test'})};
 };
 const result=await createBookingReview(config,customer,{fetcher,idempotencyKey:'request-0000001'});
 assert.equal(calls.length,2);
 assert.equal(result.reviewUrl,'https://booking.example.org/review/test');
 assert.equal(JSON.parse(calls[1].options.body).service_id,'svc_example');
 assert.equal(calls[1].options.headers['X-Booking-Continuation'],'continuation-session-token');
 assert.equal(calls.some(c=>c.url.endsWith('/bookings')),false);
});
test('does not trust an external review URL',async()=>{
 const fetcher=async(url)=>({ok:true,json:async()=>url.endsWith('/session')?{continuation:'continuation-session-token'}:{preview_handle:'preview-handle-token',review_url:'https://not-the-booking-site.com/approval'}});
 await assert.rejects(createBookingReview(config,customer,{fetcher,idempotencyKey:'request-0000001'}),/voxel_untrusted_review_url/);
});
test('commit requires customer review; request does not claim confirmation by itself',async()=>{
 const calls=[];
 const fetcher=async(url,options)=>{calls.push({url,options});return {ok:true,json:async()=>({booking_id:'booking-example',status:'pending'})};};
 const input={previewHandle:'preview-handle-token',continuation:'continuation-session-token',idempotencyKey:'commit-0000001'};
 await assert.rejects(commitApprovedBooking(config,{...input,approvalConfirmed:false},{fetcher}),/customer_review_required/);
 assert.equal(calls.length,0);
 const result=await commitApprovedBooking(config,{...input,approvalConfirmed:true},{fetcher});
 assert.equal(calls.length,1);
 assert.equal(result.voxelResponse.status,'pending');
 assert.deepEqual(JSON.parse(calls[0].options.body),{preview_handle:'preview-handle-token'});
});