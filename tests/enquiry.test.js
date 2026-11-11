import test from 'node:test';
import assert from 'node:assert/strict';
import {buildEnquiryPayload,submitEnquiry} from '../src/lib/enquiry-client.js';
import {validateBookingRequest} from '../src/lib/booking-request.js';
import {receiveEnquiry} from '../src/lib/enquiry-service.js';
const example={your_name:'Taylor Example',reply_to:'Taylor@Example.com',travel_date:'2026-11-19',travel_time:'09:30',access_needs:'Wheelchair user',help_needed:'Other',notes:'private'};
test('all Figma form categories map to a stable booking enquiry type',()=>{
 for(const [route,type] of Object.entries({companion:'companion',transfer:'airport_transfer',accessible:'accessible_transport','grocery-form':'grocery','vending-form':'vending',contact:'general'})){
   assert.equal(buildEnquiryPayload(route,example,true).requestType,type);
 }
});
test('maps Figma contact fields and omits private care details',()=>{
 const p=buildEnquiryPayload('companion',example,true);
 assert.equal(p.email,'taylor@example.com');
 assert.equal(p.fullName,'Taylor Example');
 assert.equal(p.requestedDate,'2026-11-19');
 assert.ok(!JSON.stringify(p).includes('Wheelchair'));assert.ok(!JSON.stringify(p).includes('private'));
});
test('accepts a phone-only contact from original Figma form',()=>{
 const p=buildEnquiryPayload('companion',{your_name:'Taylor Example',reply_to:'+44 7700 900123'},true);
 assert.equal(p.email,'');assert.equal(p.phone,'+44 7700 900123');assert.equal(validateBookingRequest(p).ok,true);
});
test('rejects missing consent, contact, invalid date, and unexpected clinical fields',()=>{
 const p=buildEnquiryPayload('transfer',example,true);
 assert.equal(validateBookingRequest({...p,privacyAcknowledged:false}).ok,false);
 assert.equal(validateBookingRequest({...p,email:'',phone:''}).ok,false);
 assert.equal(validateBookingRequest({...p,requestedDate:'2026-02-30'}).ok,false);
 assert.equal(validateBookingRequest({...p,clinicalNotes:'very sensitive'}).ok,false);
});
test('a mocked end-to-end enquiry returns an ID, never a confirmed booking',async()=>{
 const p=buildEnquiryPayload('companion',example,true);let persisted;
 const r=await receiveEnquiry(p,{store:async row=>{persisted=row;return {id:'f6ac30aa-7abc-43b9-99a4-aaad5a903715'};}});
 assert.equal(r.httpStatus,201);assert.equal(r.body.status,'enquiry_received');assert.equal(r.body.bookingConfirmed,undefined);
 assert.equal(persisted.requestType,'companion');
});
test('a store error does not pretend the booking succeeded',async()=>{
 const r=await receiveEnquiry(buildEnquiryPayload('companion',example,true),{store:async()=>{throw new Error('down')}});
 assert.equal(r.httpStatus,503);assert.equal(r.body.error,'temporarily_unavailable');
});
test('client distinguishes server accepted vs disabled',async()=>{
 const good=await submitEnquiry(buildEnquiryPayload('companion',example,true),async()=>({status:201,json:async()=>({status:'enquiry_received',requestId:'ref-123'})}));
 assert.deepEqual({ok:good.ok,requestId:good.requestId},{ok:true,requestId:'ref-123'});
 const disabled=await submitEnquiry({},async()=>({status:503,json:async()=>({error:'enquiries_not_enabled'})}));
 assert.equal(disabled.ok,false);assert.match(disabled.error,/not enabled/i);
});
test('validates booking intake without exposing private free text',()=>{
 const p=buildEnquiryPayload('accessible',example,true);assert.equal(validateBookingRequest(p).ok,true);
 assert.equal(Object.keys(validateBookingRequest(p).value).includes('access_needs'),false);
});