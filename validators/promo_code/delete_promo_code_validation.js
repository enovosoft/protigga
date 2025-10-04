const { default: z } = require('zod');

const delete_promocode_validation = z.object({
  promo_code_id: z.string().nonempty({ message: 'missing promocode id' }),
});

module.exports = delete_promocode_validation;
