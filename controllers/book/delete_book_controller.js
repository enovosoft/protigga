const prisma = require('../../config/db');
const responseGenerator = require('../../utils/responseGenerator');
const find_book = require('./utils/find_book');

const delete_book_controller = async (req, res, next) => {
  try {
    const { book_id } = req.body || {};
    //============ find book
    const { exist } = await find_book({ book_id });
    if (!exist)
      return responseGenerator(404, res, {
        message: 'book not found',
        success: false,
        error: true,
      });
    // ======== delete : book
    const deleted_book = await prisma.book.delete({
      where: {
        book_id,
      },
    });
    //=================== if failed to delete

    if (!deleted_book?.book_id)
      return responseGenerator(201, res, {
        message: 'Unable to delete',
        success: false,
        error: true,
      });
    //=================== successfully deleted response
    if (deleted_book?.book_id)
      return responseGenerator(201, res, {
        message: 'successfully deleted',
        success: true,
        error: false,
        deleted_book,
      });
  } catch (error) {
    return next(error);
  }
};

module.exports = delete_book_controller;
