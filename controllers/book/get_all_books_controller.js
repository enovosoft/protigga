const prisma = require('../../config/db');
const responseGenerator = require('../../utils/responseGenerator');

const get_all_books_controller = async (req, res, next) => {
  try {
    let { featured } = req.query || '';
    if (String(featured).toLowerCase() == 'true') featured = true;
    else featured = false;
    // ========= search
    const all_books = await prisma.book.findMany({
      where: featured
        ? {
            is_deleted: false,
            is_featured: featured,
          }
        : {
            is_deleted: false,
          },
      select: {
        book_id: true,
        title: true,
        price: true,
        book_image: true,
        slug: true,
        writter: true,
        createdAt: true,
        updatedAt: true,
        batch: true,
        stock: true,
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
