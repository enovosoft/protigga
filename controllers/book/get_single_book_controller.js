const responseGenerator = require('../../utils/responseGenerator');
const find_book = require('./utils/find_book');

const get_single_book_controller = async (req, res, next) => {
  try {
    const { slug } = req.params || '';

    //  ============ find book
    const { exist, book } = await find_book({
      slug,
    });
    if (!exist)
      return responseGenerator(404, res, {
        message: 'Book info found',
        success: false,
        error: true,
      });
    //  ====
    return responseGenerator(200, res, {
      message: 'book found',
      success: true,
      error: false,
      book,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = get_single_book_controller;
