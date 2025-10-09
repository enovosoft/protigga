const prisma = require('../../config/db');
const responseGenerator = require('../../utils/responseGenerator');
const slug_generator = require('../../utils/slug_generator');
const find_book = require('./utils/find_book');

const update_book_controller = async (req, res, next) => {
  try {
    let { book_id, book_image, title, price, writter, description, batch } =
      req.body || {};

    //  =========== find book
    const { exist, book } = await find_book({ book_id });

    // ========== check : if not exist
    if (!exist)
      return responseGenerator(404, res, {
        message: 'book not found',
        error: true,
        success: false,
      });
    //  =========== new slug
    let new_slug = slug_generator(title);
    if (book?.title !== title) {
      const { exist: exis_new } = await find_book({ slug: new_slug });
      if (exis_new) new_slug = slug_generator(title, false);
    }

    // =========== update : book object
    const updated_book = await prisma.book.update({
      where: {
        book_id,
      },
      data: {
        slug: new_slug,
        book_image,
        title,
        price,
        batch,
        writter,
        description,
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
