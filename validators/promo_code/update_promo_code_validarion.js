const { z } = require('zod');

const update_promo_code_validarion = z.object({
  promo_code_id: z.string().nonempty({ message: 'missing promocode id' }),
  promocode_for: z.string().nonempty({ message: 'missing applicable type' }),
  Discount_type: z.string().nonempty({ message: 'Discount type missing' }),
  Discount: z.number({
    invalid_type_error: 'please input percentage or fixed amount',
  }),
  Max_discount_amount: z.number({
    invalid_type_error: 'please enter max discount amount',
  }),
  Min_purchase_amount: z.number({
    invalid_type_error: 'please enter min purchase amount',
  }),
  expiry_date: z.string().nonempty({ message: 'expiry date missing' }), // or z.date() if using Date objects
  status: z.enum(['active', 'inactive'], {
    message: 'promocode status missing',
  }), // if status is limited to certain values
});

module.exports = update_promo_code_validarion;
