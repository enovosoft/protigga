const prisma = require('../../config/db');
const responseGenerator = require('../../utils/responseGenerator');

const get_all_books_controller = async (req, res, next) => {
  try {
    // ========= search
    const all_books = await prisma.book.findMany({
      select: {
        book_id: true,
        title: true,
        price: true,
        book_image: true,
        slug: true,
        writter: true,
        createdAt: true,
        updatedAt: true,
      },
      where: {
        is_deleted: false,
      },
    });
    if (all_books)
      return responseGenerator(200, res, {
        message: 'all books found',
        error: false,
        success: true,
        count: all_books.length,
        books: all_books,
      });
  } catch (error) {
    return next(error);
  }
};

module.exports = get_all_books_controller;
