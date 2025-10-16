const prisma = require('../../config/db');
const responseGenerator = require('../../utils/responseGenerator');
const slug_generator = require('../../utils/slug_generator');
const find_book = require('./utils/find_book');

const update_book_controller = async (req, res, next) => {
  try {
    let {
      book_id,
      book_image,
      is_featured,
      title,
      price,
      writter,
      description,
      batch,
      stock,
    } = req.body || {};

    //  =========== find book
    let { exist, book } = await find_book({ book_id });

    // ========== check : if not exist
    if (!exist)
      return responseGenerator(404, res, {
        message: 'book not found',
        error: true,
        success: false,
      });
    //  =========== new slug
    let slug = slug_generator(title);
    let { exist_ } = await find_book({ slug });
    exist = exist_;
    while (exist) {
      slug = slug_generator(title, false);
      const { exist: exist_ } = await find_book({ slug });
      exist = exist_;
    }

    // =========== update : book object
    const updated_book = await prisma.book.update({
      where: {
        book_id,
      },
      data: {
        slug,
        book_image,
        title,
        price,
        batch,
        writter,
        description,
        is_featured,
        stock,
      },
    });
    //=================== check : if update failed
    if (!updated_book?.book_id)
      return responseGenerator(500, res, {
        message: 'Something went wrong',
        success: false,
        error: true,
      });
    //=================== successfully updated response
    if (updated_book?.book_id)
      return responseGenerator(201, res, {
        message: 'successfully updated',
        success: true,
        error: false,
        updated_details: updated_book,
      });
  } catch (error) {
    return next(error);
  }
};
module.exports = update_book_controller;
