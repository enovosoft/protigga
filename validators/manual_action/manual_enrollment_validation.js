const { default: z } = require('zod');

const manual_enrollment_validation = z.object({
  enrollment_type: z.enum(['online', 'hybrid']).optional().default('online'),
  phone: z.string('phone number missing'),
  course_id: z.string('course id missing'),
  expiry_date: z.iso
    .datetime('Expiry date missing')
    .optional()
    .default(undefined),
  product_price: z.number('Product price missing'),
  discount_amount: z.number('discount amount missing'),
  paid_amount: z.number('paid amount missing'),
  Txn_ID: z.string('transaction id missing').optional(),
  payment_status: z.enum(
    ['PENDING', 'SUCCESS', 'FAILED', 'REFUNDED', 'CANCELLED'],
    'payment status missing'
  ),
  enrollment_status: z.enum(
    ['pending', 'failed ', 'success', 'cancelled', 'refunded'],
    'enrollment status missing'
  ),
  address: z.string('address missing'),
  method: z.enum(
    ['BKASH', 'NAGAD', 'STRIPE', 'SSL_COMMERZ', 'CASH', 'OTHER', 'BANK'],
    'payment mathod amount missing'
  ),
  remarks: z.string('remark is missing '),
});

module.exports = manual_enrollment_validation;
