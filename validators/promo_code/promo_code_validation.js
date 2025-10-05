const { default: z } = require('zod');

const promo_code_validation = z.object({
  promocode: z.string().nonempty({ message: 'promocode musy be given' }),
  promocode_for: z
    .string()
    .nonempty({ message: 'applicable type must be given' }),
});

module.exports = promo_code_validation;
