const { default: z } = require('zod');

const delete_book_validation = z.object({
  book_id: z.string().nonempty({ message: 'book id image missing' }),
});

module.exports = delete_book_validation;
