const { default: z } = require('zod');

const save_enromment_validation_schema = z.object({
  user_id: z.string('user_id is missing'),
  product_price: z.number('product_price is missing'),
  promo_code: z.string().optional().nullable(),
  promo_code_id: z.string().optional().nullable(),
  enrollment_type: z.enum(['online', 'hybrid']).optional().default('online'),
  address: z.string({ message: 'address is missing' }),
  Txn_ID: z.string({ message: 'Txn_ID is missing' }),
});

module.exports = save_enromment_validation_schema;
