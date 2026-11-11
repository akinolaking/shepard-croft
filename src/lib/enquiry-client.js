/** Public client payload: intentionally exclude care assessments, clinical notes,
 * accessibility details, free-text messages and any other sensitive information.
 * Those fields remain in the user's browser/email draft, not in Neon. */
export const SERVICE_TYPES = Object.freeze({
  companion: 'companion',
  transfer: 'airport_transfer',
  accessible: 'accessible_transport',
  'grocery-form': 'grocery',
  'vending-form': 'vending',
  contact: 'general'
});

/** @param {string} route @param {Record<string,string>} values @param {boolean} acknowledged */
export function buildEnquiryPayload(route, values, acknowledged) {
  const contact = String(values.reply_to ?? '').trim();
  const email = contact.includes('@') ? contact.toLowerCase() : '';
  const phone = email ? '' : contact;
  return {
    fullName: String(values.your_name ?? '').trim(),
    email, phone,
    requestType: SERVICE_TYPES[route] || 'general',
    requestedDate: String(values.travel_date ?? '').trim(),
    requestedTime: String(values.travel_time ?? '').trim(),
    privacyAcknowledged: acknowledged === true
  };
}

/** @returns {Promise<{ok:boolean,requestId?:string,error?:string,status?:number}>} */
export async function submitEnquiry(payload, fetcher = fetch) {
  try {
    const response = await fetcher('/api/booking-requests', {
      method: 'POST', headers: {'Content-Type':'application/json'},
      credentials: 'same-origin', body: JSON.stringify(payload)
    });
    const body = await response.json().catch(() => ({}));
    if (response.status === 201 && body.status === 'enquiry_received' && typeof body.requestId === 'string') {
      return {ok:true,requestId:body.requestId,status:201};
    }
    const error = body.error === 'invalid_request' ? 'Please check your contact details and privacy acknowledgement.'
      : body.error === 'enquiries_not_enabled' ? 'Online enquiries are not enabled yet.'
      : 'Online submission is unavailable. Nothing has been sent.';
    return {ok:false,error,status:response.status};
  } catch {
    return {ok:false,error:'Unable to reach the enquiry service. Nothing has been sent.'};
  }
}