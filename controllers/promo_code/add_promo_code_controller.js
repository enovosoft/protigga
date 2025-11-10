const shortid = require('shortid');
const prisma = require('../../config/db');
const responseGenerator = require('../../utils/responseGenerator');
const find_promocode = require('./utils/find_promocode');

const add_promo_code_controller = async (req, res, next) => {
  try {
    const {
      promocode_for,
      Discount_type,
      promo_code,
      Discount,
      Max_discount_amount,
      Min_purchase_amount,
      expiry_date,
      status,
      book_id,
      course_id,
    } = req.body || {};

    //================= check : already in db or not
    const { exist } = await find_promocode({ promo_code });
    // ============== response: if already exist
    if (exist)
      return responseGenerator(400, res, {
        message:
          'your given promocode already exist. please select another one',
        success: false,
        error: true,
      });

    //================= check foreign keys based on promocode_for
    let valid_book_id = null;
    let valid_course_id = null;

    if (promocode_for === 'book') {
      if (!book_id) {
        return responseGenerator(400, res, {
          message: 'book_id is required when promocode_for is BOOK',
          success: false,
          error: true,
        });
      }

      const bookExists = await prisma.book.findUnique({
        where: { book_id },
      });
      if (!bookExists) {
        return responseGenerator(400, res, {
          message: 'Invalid book_id. Book does not exist.',
          success: false,
          error: true,
        });
      }
      valid_book_id = book_id;
    }

    if (promocode_for === 'course') {
      if (!course_id) {
        return responseGenerator(400, res, {
          message: 'course id is required ',
          success: false,
          error: true,
        });
      }

      const courseExists = await prisma.course.findUnique({
        where: { course_id },
      });
      if (!courseExists) {
        return responseGenerator(400, res, {
          message: 'Invalid course_id. Course does not exist.',
          success: false,
          error: true,
        });
      }
      valid_course_id = course_id;
    }
    // ================ create promocode
    const added_promocode = await prisma.promo_code.create({
      data: {
        promo_code_id: shortid.generate(),
        promocode_for,
        Discount_type,
        Discount,
        promo_code,
        Max_discount_amount,
        Min_purchase_amount,
        expiry_date,
        status,
        book_id: valid_book_id,
        course_id: valid_course_id,
      },
      include: {
        book: true,
        course: false,
      },
    });
    // ============ response :  not successfull
    if (!added_promocode?.id)
      return responseGenerator(201, res, {
        success: false,
        error: false,
        message: 'something went wrong',
        promocode: added_promocode,
      });
    // ============ response :   successfull
    if (added_promocode?.id)
      return responseGenerator(201, res, {
        message: 'successfullt added',
        success: true,
        error: false,
        promocode: added_promocode,
      });
  } catch (error) {
    return next(error);
  }
};

module.exports = add_promo_code_controller;
