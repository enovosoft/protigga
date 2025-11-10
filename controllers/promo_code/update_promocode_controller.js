const prisma = require('../../config/db');
const responseGenerator = require('../../utils/responseGenerator');
const find_promocode = require('./utils/find_promocode');

const update_promocode_controller = async (req, res, next) => {
  try {
    const {
      promo_code_id,
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
    //========= check: does new promocode is unique
    const { exist: unique_exist } = await find_promocode({
      promo_code,
      promo_code_id: {
        not: promo_code_id,
      },
    });
    if (unique_exist)
      return responseGenerator(400, res, {
        message: 'your new promocode already exist. please select another one',
        success: false,
        error: true,
      });
    // ======== find:  promocode
    const { exist } = await find_promocode({
      promo_code_id,
    });
    // ======== response : not exist
    if (!exist)
      return responseGenerator(400, res, {
        message: 'Promocode not found',
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
    // ============= update part:
    const updated_promocode = await prisma.promo_code.update({
      where: {
        promo_code_id,
      },
      data: {
        promocode_for,
        Discount_type,
        promo_code,
        Discount,
        Max_discount_amount,
        Min_purchase_amount,
        expiry_date,
        status,
        book_id: valid_book_id,
        course_id: valid_course_id,
      },
      include: {
        course: true,
        book: true,
      },
    });
    // =========== response : not successfull
    if (!updated_promocode?.id)
      return responseGenerator(500, res, {
        message: 'something went wrong',
        error: true,
        success: false,
      });
    // =========== response :  successfull
    if (updated_promocode?.id)
      return responseGenerator(201, res, {
        message: 'Successfully updated',
        error: false,
        success: true,
        updated_promocode,
      });
  } catch (error) {
    return next(error);
  }
};

module.exports = update_promocode_controller;
