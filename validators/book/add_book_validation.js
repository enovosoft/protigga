const { default: z } = require('zod');

const add_book_validation = z.object({
  book_image: z.string('Book image missing'),
  title: z.string('title is missing'),
  batch: z.string('batch missing'),
  is_featured: z.boolean('Data missing'),
  demo_file_link: z.string('demo pdf/img missing'),
  stock: z.number('stock is missing'),
  price: z
    .number({
      required_error: 'price is missing',
      invalid_type_error: 'price must be a number',
    })
    .min(0, { message: 'price must be at least 0' }),
  writter: z.string('writter name is missing'),
  description: z.string('book description is missing'),
});

module.exports = add_book_validation;
