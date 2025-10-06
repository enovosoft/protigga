const { z } = require('zod');

const save_order_object_validation_schema = z.object({
  product_name: z.string('product_name is missing'),
  user_id: z.string("'user_id is missing'"),
  product_price: z.number('product_price is missing'),
  dicount: z.number('discount missing').optional(),
  quantity: z.number('quantity is missing'),
  promo_code: z.string().optional().nullable(),
  promo_code_id: z.string().optional().nullable(),
  address: z.string({ message: 'address is missing' }),
  status: z.string({ message: 'status is missing' }),
  Txn_ID: z.string({ message: 'Txn_ID is missing' }),
  payment_method: z.string({ message: 'payment_method is missing' }),
});

module.exports = save_order_object_validation_schema;
