// Normalize Bangladeshi phone number
const normalizePhoneNumber = (phone) => {
  let normalized = String(phone).trim();

  // যদি +880 দিয়ে শুরু না হয় → prepend +88 এবং যদি 0 দিয়ে শুরু হয় তা remove
  if (!normalized.startsWith('+880')) {
    normalized = '+880' + normalized.replace(/^0/, '');
  }

  return normalized;
};

module.exports = normalizePhoneNumber;
