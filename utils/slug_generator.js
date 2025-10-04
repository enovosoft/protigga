const slug_generator = (str, unique = true) => {
  // 1️⃣ Basic slugify
  let slug = String(str)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // special chars remove
    .replace(/\s+/g, '-') // spaces -> dash
    .replace(/-+/g, '-'); // multiple dash -> single

  // 2️⃣ Unique suffix if required
  if (!unique) {
    const randomPart = Math.random().toString(36).substring(2, 8); // 6-char random
    slug += `-${randomPart}`;
  }

  return slug;
};

module.exports = slug_generator;
