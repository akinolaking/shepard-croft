export const REQUEST_TYPES = Object.freeze(["companion","healthcare_support","transport","accessible_transport","airport_transfer","grocery","vending"]);

export function validateBookingRequest(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return { ok: false, errors: { body: "A JSON object is required." } };
  }

  const errors = {};
  const fullName = typeof input.fullName === "string" ? input.fullName.trim() : "";
  const email = typeof input.email === "string" ? input.email.trim().toLowerCase() : "";
  const phone = typeof input.phone === "string" ? input.phone.trim() : "";
  const requestType = typeof input.requestType === "string" ? input.requestType.trim() : "";
  const date = typeof input.requestedDate === "string" ? input.requestedDate.trim() : "";
  const time = typeof input.requestedTime === "string" ? input.requestedTime.trim() : "";

  if (fullName.length < 2 || fullName.length > 120) {
    errors.fullName = "Enter a name of 2–120 characters.";
  }
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = "Enter a valid email address.";
  }
  if (phone && !/^[+()\d\s.-]{7,32}$/.test(phone)) {
    errors.phone = "Enter a valid telephone number.";
  }
  if (!REQUEST_TYPES.includes(requestType)) {
    errors.requestType = "Select an available service.";
  }
  if (date) {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
    const dateObject = match ? new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]))) : null;
    if (!dateObject || Number.isNaN(dateObject.getTime()) || dateObject.toISOString().slice(0, 10) !== date) {
      errors.requestedDate = "Use a valid date in YYYY-MM-DD format.";
    }
  }
  if (time && (!/^\d{2}:\d{2}$/.test(time) || Number(time.slice(0, 2)) > 23 || Number(time.slice(3, 5)) > 59)) {
    errors.requestedTime = "Use a valid time in HH:MM format.";
  }
  if (input.privacyAcknowledged !== true) {
    errors.privacyAcknowledged = "Privacy information must be acknowledged.";
  }

  if (Object.keys(errors).length) return { ok: false, errors };
  return {
    ok: true,
    value: {
      fullName,
      email,
      phone: phone || null,
      requestType,
      requestedDate: date || null,
      requestedTime: time || null
    }
  };
}
