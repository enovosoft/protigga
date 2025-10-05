const { default: z } = require('zod');

const add_book_validation = z.object({
  book_image: z.string().nonempty({ message: 'Book image missing' }),
  title: z.string().nonempty({ message: 'title is missing' }),
  price: z
    .number({
      required_error: 'price is missing',
      invalid_type_error: 'price must be a number',
    })
    .min(0, { message: 'price must be at least 0' }),
  writter: z.string().nonempty({ message: 'writter name is missing' }),
  description: z.string().nonempty({ message: 'book description is missing' }),
});

module.exports = add_book_validation;
