const { z } = require('zod');

// ✅ Only +880 format: +8801XXXXXXXXX
const bdPhone = z.string().regex(/^\+8801[3-9][0-9]{8}$/);

const MaterialType = z.enum(['book', 'course']);
const DeliveryType = z.enum(['COD', 'Prepaid', 'none']);

const MaterialDetailsSchema = z.object({
  product_id: z.string('product id missing'),
  quantity: z.number().int().min(1, 'Min order count 1'),
  promo_code_id: z.string().optional(),
});

const ssl_int_validation = z.object({
  meterial_type: MaterialType,
  delevery_type: DeliveryType,
  inside_dhaka: z.boolean('Missing data'),
  outside_dhaka: z.boolean('missing data'),
  sundarban_courier: z.boolean('missing data'),
  address: z.string('address missing'),
  alternative_phone: z.string('alternative phone number missing').optional(),
  meterial_details: MaterialDetailsSchema,
});

module.exports = ssl_int_validation;
