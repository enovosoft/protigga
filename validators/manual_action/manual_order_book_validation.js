const { default: z } = require('zod');

const OrderStatus = {
  pending: 'pending',
  confirmed: 'confirmed',
  cancelled: 'cancelled',
  failed: 'failed',
};

const PaymentStatus = {
  PENDING: 'PENDING',
  SUCCESS: 'SUCCESS',
  FAILED: 'FAILED',
  REFUNDED: 'REFUNDED',
  CANCELLED: 'CANCELLED',
};

const manual_book_order_validation = z.object({
  user_id: z.string('User ID is required'),
  book_id: z.string('User book is required'),
  product_price: z.number({
    invalid_type_error: 'Product price must be a number',
  }),
  quantity: z
    .number({ invalid_type_error: 'Quantity must be a number' })
    .int({ message: 'Quantity must be an integer' }),
  address: z.string('Address is required'),
  Txn_ID: z.string().default('MANUAL'),
  alternative_phone: z.string().optional(),
  discount_amount: z.number('Discount amount must be a number').optional(),
  due_amount: z.number('Due amount must be a number').optional(),
  after_discounted_amount: z
    .number('After discounted amount must be a number')
    .optional(),
  discount: z.number('Discount must be a number').optional(),
  book_order_status: z.enum(
    Object.values(OrderStatus),
    'book order status missing'
  ),
  payment_status: z.enum(
    Object.values(PaymentStatus),
    'Payment status missing'
  ),
});

module.exports = manual_book_order_validation;
