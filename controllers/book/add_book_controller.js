const shortid = require('shortid');
const prisma = require('../../config/db');
const slug_generator = require('../../utils/slug_generator');
const find_book = require('./utils/find_book');
const responseGenerator = require('../../utils/responseGenerator');

const add_book_controller = async (req, res, next) => {
  try {
    const { book_image, title, price, writter, description, batch } =
      req.body || {};
    //============== generate_slug
    let slug = slug_generator(title);
    //============= check: uniqueness of slug
    const { exist } = await find_book({ slug });
    if (exist) slug = slug_generator(title, false);
    // ============= save book data
    const added_book = await prisma.book.create({
      data: {
        book_id: shortid.generate(),
        slug,
        book_image,
        title,
        batch,
        price,
        writter,
        description,
      },
    });
    //========= check: if not added
    if (!added_book?.book_id)
      return responseGenerator(500, res, {
        message: 'something went wrong. try again',
        error: true,
        success: false,
      });
    if (added_book?.book_id)
      return responseGenerator(201, res, {
        message: 'successfully added',
        error: false,
        success: true,
        book: added_book,
      });
  } catch (error) {
    return next(error);
  }
};

module.exports = add_book_controller;
