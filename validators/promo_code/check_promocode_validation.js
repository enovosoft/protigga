const { default: z } = require('zod');

const check_promocode_validation = z.object({
  promocode: z.string('promocode is missing'),
  promocode_for: z.enum(['book', 'course', 'all'], 'invalid promocode type'),
  product_id: z.string('product id is missing'),
});

module.exports = check_promocode_validation;
