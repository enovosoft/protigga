const { default: z } = require('zod');

const delete_book_validation = z.object({
  book_id: z.string('book id image missing'),
});

module.exports = delete_book_validation;
