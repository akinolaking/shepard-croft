/** Generic enquiries only. NEVER a confirmed booking or clinical data store. */
export const REQUEST_TYPES = Object.freeze([
 'companion','healthcare_support','transport','accessible_transport',
 'airport_transfer','grocery','vending','general'
]);
export function validateBookingRequest(input){
 if(!input||typeof input!=='object'||Array.isArray(input))return {ok:false,errors:{body:'A JSON object is required.'}};
 const errors={};
 // Reject clinical fields, notes, assessment text and unexpected objects; never persist them.
 const fields=Object.keys(input);
 const allowed=new Set(['fullName','email','phone','requestType','requestedDate','requestedTime','privacyAcknowledged','website']);
 if(fields.some(k=>!allowed.has(k)))errors.body='This form accepts contact and scheduling details only.';
 if(input.website)errors.body='Request rejected.'; // honeypot
 const fullName=typeof input.fullName==='string'?input.fullName.trim():'';
 const email=typeof input.email==='string'?input.email.trim().toLowerCase():'';
 const phone=typeof input.phone==='string'?input.phone.trim():'';
 const requestType=typeof input.requestType==='string'?input.requestType.trim():'';
 const date=typeof input.requestedDate==='string'?input.requestedDate.trim():'';
 const time=typeof input.requestedTime==='string'?input.requestedTime.trim():'';
 if(fullName.length<2||fullName.length>120)errors.fullName='Enter a name of 2–120 characters.';
 if(!email&&!phone)errors.contact='An email address or telephone number is required.';
 if(email&&(email.length>254||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)))errors.email='Enter a valid email address.';
 if(phone&&!/^[+()\d\s.-]{7,32}$/.test(phone))errors.phone='Enter a valid telephone number.';
 if(!REQUEST_TYPES.includes(requestType))errors.requestType='Choose an available service.';
 if(date){const m=/^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
   const d=m?new Date(Date.UTC(+m[1],+m[2]-1,+m[3])):null;
   if(!d||Number.isNaN(d.getTime())||d.toISOString().slice(0,10)!==date)errors.requestedDate='Use YYYY-MM-DD.';}
 if(time&&(!/^\d{2}:\d{2}$/.test(time)||Number(time.slice(0,2))>23||Number(time.slice(3,5))>59))errors.requestedTime='Use HH:MM.';
 if(input.privacyAcknowledged!==true)errors.privacyAcknowledged='Privacy information must be acknowledged.';
 if(Object.keys(errors).length)return {ok:false,errors};
 return {ok:true,value:{fullName,email:email||null,phone:phone||null,requestType,
   requestedDate:date||null,requestedTime:time||null}};
}