const { default: z } = require('zod');

const update_book_validation = z.object({
  book_id: z.string().nonempty({ message: 'book id image missing' }),
  book_image: z.string().nonempty({ message: 'Book image missing' }),
  title: z.string().nonempty({ message: 'title is missing' }),
  batch: z.string('batch missing'),
  is_featured: z.boolean('data missing'),
  demo_file_link: z.string('demo pdf/img missing'),
  stock: z.number('stock is missing'),
  price: z
    .number({
      required_error: 'price is missing',
      invalid_type_error: 'price must be a number',
    })
    .min(0, { message: 'price must be at least 0' }),
  writter: z.string().nonempty({ message: 'writter name is missing' }),
  description: z.string().nonempty({ message: 'book description is missing' }),
});

module.exports = update_book_validation;
