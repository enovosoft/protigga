const slug_generator = (str, unique = true) => {
  let slug = String(str)
    .trim()
    .toLowerCase()
    // Allow Bangla (Unicode range: \u0980-\u09FF), English letters, digits, space, and hyphen
    .replace(/[^a-z0-9\u0980-\u09FF\s-]/g, '')
    .replace(/\s+/g, '-') // spaces -> dash
    .replace(/-+/g, '-'); // multiple dash -> single

  // Add unique random suffix if requested
  if (!unique) {
    const randomPart = Math.random().toString(36).substring(2, 8);
    slug += `-${randomPart}`;
  }

  return slug;
};

module.exports = slug_generator;
