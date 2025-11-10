const { z } = require('zod');

const add_promo_code_validation = z
  .object({
    promocode_for: z.enum(['all', 'book', 'course'], 'invalid type'),
    Discount_type: z.string('Discount type missing'),
    Discount: z.number('please input percentage or fixed amount'),
    Max_discount_amount: z.number('please enter max discount amount'),

    Min_purchase_amount: z.number('please enter min purchase amount'),
    book_id: z.string().optional(),
    expiry_date: z.iso.datetime("'expiry date missing"), // or z.date() if using Date objects
    course_id: z.string().optional(),
    status: z.enum(['active', 'inactive'], 'promocode status missing'),
  })
  .superRefine((data, ctx) => {
    if (data.promocode_for === 'book' && !data.book_id) {
      ctx.addIssue({
        code: z.custom,
        message: 'book_id is required when promocode_for is BOOK',
        path: ['book_id'],
      });
    }
    if (data.promocode_for === 'course' && !data.course_id) {
      ctx.addIssue({
        code: z.custom,
        message: 'course_id is required when promocode_for is COURSE',
        path: ['course_id'],
      });
    }
    if (data.promocode_for === 'all' && (data.book_id || data.course_id)) {
      ctx.addIssue({
        code: z.custom,
        message: 'book_id/course_id must be empty when promocode_for is ALL',
        path: ['book_id', 'course_id'],
      });
    }
  });

module.exports = add_promo_code_validation;
