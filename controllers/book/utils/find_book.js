const prisma = require('../../../config/db');

const find_book = async (data = {}, options = {}) => {
  try {
    const find_book = await prisma.book.findFirst({
      where: {
        is_deleted: false,
        ...data,
      },
      ...options,
    });

    return {
      exist: find_book?.book_id ? true : false,
      book: find_book,
    };
  } catch (error) {
    throw new Error(error);
  }
};

module.exports = find_book;
