const { z } = require('zod');

// ✅ Only +880 format: +8801XXXXXXXXX
const bdPhone = z.string().regex(/^\+8801[3-9][0-9]{8}$/);

const MaterialType = z.enum(['book', 'course', 'stationery']);
const DeliveryType = z.enum(['COD', 'Prepaid', 'Pickup', 'none']);

const CustomerSchema = z.object({
  name: z.string().min(2, 'minimum length of name is 2').max(100),
  address: z.string().min(3, 'please give correct address'),
  alternative_phone: bdPhone.optional(),
});

const MaterialDetailsSchema = z.object({
  product_name: z.string().min(1),
  product_id: z.string().min(1),
  user_id: z.string().min(1),
  quantity: z.number().int().min(1, 'Min order count 1'),
  promo_code_id: z.string().min(1).optional(),
});

const ssl_int_validation = z.object({
  meterial_type: MaterialType,
  inside_dhaka: z.boolean('Missing data'),
  outside_dhaka: z.boolean('missing data'),
  sundarban_courier: z.boolean('missing data'),
  delevery_type: DeliveryType,
  customer: CustomerSchema,
  meterial_details: MaterialDetailsSchema,
});

module.exports = ssl_int_validation;
