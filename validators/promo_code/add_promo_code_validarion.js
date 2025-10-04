const { z } = require('zod');

const add_promo_code_validation = z.object({
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

module.exports = add_promo_code_validation;
