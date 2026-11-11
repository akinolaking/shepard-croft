/**
 * Optional VoxelBooking public booking client. Does not make a booking until
 * the customer has reviewed and approved on VoxelBooking's trusted page.
 * The session continuation is a short-lived task credential, never a login.
 */
const validDate = s => /^\d{4}-\d{2}-\d{2}$/.test(s);
const validTime = s => /^\d{2}:\d{2}$/.test(s) && +s.slice(0,2) < 24 && +s.slice(3,5) < 60;
const validEmail = s => typeof s === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
const safeToken = s => typeof s === 'string' && s.length >= 8 && s.length <= 512 && !/[\r\n]/.test(s);
const safeKey = s => typeof s === 'string' && s.length >= 8 && s.length <= 128 && /^[a-zA-Z0-9_.-]+$/.test(s);
export function getVoxelConfig(env) {
 if (env.SHPRD_VOXELBOOKING_ENABLED !== 'true') throw new Error('voxel_not_enabled');
 const base = String(env.VOXELBOOKING_BASE_URL||'').replace(/\/+$/,'');
 const slug = String(env.VOXELBOOKING_BUSINESS_SLUG||'');
 let url;
 try {url = new URL(base);} catch {throw new Error('voxel_not_configured');}
 if(url.protocol !== 'https:' || url.username || url.password || url.search || url.hash ||
     !/^[a-z0-9-]{2,100}$/.test(slug)) throw new Error('voxel_not_configured');
 return {base:url.origin,slug,serviceId:String(env.VOXELBOOKING_SERVICE_ID||'')};
}
async function requestJson(fetcher,url,options){
 const r = await fetcher(url,options);
 let json;try{json=await r.json();}catch{throw new Error('voxel_invalid_response');}
 if(!r.ok)throw new Error(typeof json?.code==='string'?json.code:'voxel_unavailable');
 return json.data||json;
}
export function validateAppointmentInput(v){
 if(!v||typeof v!=='object')return false;
 return typeof v.name==='string'&&v.name.trim().length>=2&&v.name.length<=120&&
 validEmail(v.email)&&validDate(v.date)&&validTime(v.time);
}
export async function createBookingReview(config,appointment,{fetcher=fetch,idempotencyKey}){
 if(!validateAppointmentInput(appointment)||!config.serviceId||!safeKey(idempotencyKey))throw new Error('invalid_booking_request');
 const path=`${config.base}/api/agent/v2/public/${encodeURIComponent(config.slug)}`;
 const session=await requestJson(fetcher,`${path}/session`,{method:'POST',headers:{'Content-Type':'application/json','Idempotency-Key':idempotencyKey+'-s'},body:'{}'});
 if(!safeToken(session.continuation))throw new Error('voxel_invalid_session');
 const review=await requestJson(fetcher,`${path}/bookings/preview`,{method:'POST',headers:{'Content-Type':'application/json','X-Booking-Continuation':session.continuation,'Idempotency-Key':idempotencyKey+'-p'},body:JSON.stringify({service_id:config.serviceId,date:appointment.date,time:appointment.time,customer:{name:appointment.name.trim(),email:appointment.email.trim()}})});
 if(!safeToken(review.preview_handle)||typeof review.review_url!=='string')throw new Error('voxel_invalid_preview');
 const reviewUrl=new URL(review.review_url);
 // The review link should be served by the trusted booking installation.
 if(reviewUrl.protocol!=='https:'||reviewUrl.origin!==config.base)throw new Error('voxel_untrusted_review_url');
 return {reviewUrl:reviewUrl.href,previewHandle:review.preview_handle,continuation:session.continuation};
}
export async function commitApprovedBooking(config,{previewHandle,continuation,idempotencyKey,approvalConfirmed},{fetcher=fetch}){
 if(approvalConfirmed!==true)throw new Error('customer_review_required');
 if(!safeToken(previewHandle)||!safeToken(continuation)||!safeKey(idempotencyKey))throw new Error('invalid_booking_commit');
 const path=`${config.base}/api/agent/v2/public/${encodeURIComponent(config.slug)}`;
 const result=await requestJson(fetcher,`${path}/bookings`,{method:'POST',headers:{'Content-Type':'application/json','X-Booking-Continuation':continuation,'Idempotency-Key':idempotencyKey},body:JSON.stringify({preview_handle:previewHandle})});
 // Never infer confirmation from a 2xx alone: only VoxelBooking receipt conveys the state.
 return {voxelResponse:result};
}