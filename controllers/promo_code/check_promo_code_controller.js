const prisma = require('../../config/db');
const bcrypt = require('bcrypt');
const responseGenerator = require('../../utils/responseGenerator');
const check_promo_code_controller = async (req, res, next) => {
  try {
    const { promocode, promocode_for, product_id } = req.body;

    // Fetch the promo code from DB
    const promo = (await prisma.promo_code.findFirst({
      where: {
        promo_code: promocode,
        // promocode_for,
      },
      include: {
        book: true,
        course: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })) || {
      promo_code: '',
      Discount_type: 'fixed',
      Discount: 0,
      Max_discount_amount: 0,
      status: 'active',
      applicable_for: 'all',
      book: null,
      course: null,
      default: true,
    };

    // ==================== promocode checking part 1
    if (
      (promo?.book == null && promo?.promocode_for == 'book') ||
      (promo?.course == null && promo?.promocode_for == 'course')
    ) {
      return responseGenerator(404, res, {
        message: 'Please provide a valid promo code',
        success: false,
        error: true,
      });
    }
    // ==================== promocode checking part 2
    console.log(product_id);
    if (
      (promo?.book !== null &&
        promo?.book.book_id !== product_id &&
        promo?.promocode_for !== 'all') ||
      (promo?.course !== null &&
        promo?.course.course_id !== product_id &&
        promo?.promocode_for !== 'all')
    ) {
      return responseGenerator(404, res, {
        message: 'this code is not applicatble for this product',
        success: false,
        error: true,
      });
    }

    if (!promo) {
      // Generic message to avoid info leak
      return responseGenerator(404, res, {
        success: false,
        error: true,
        message: 'Promo code not valid',
      });
    }

    // Check if promo code is active
    if (promo.status !== 'active') {
      return responseGenerator(400, res, {
        success: false,
        error: true,
        message: 'Promo code is inactive',
      });
    }

    // Check expiry
    const now = new Date();
    if (promo.expiry_date < now) {
      return responseGenerator(400, res, {
        success: false,
        error: true,
        message: 'Promo code has expired',
      });
    }

    if (promo?.default == true) {
      return responseGenerator(404, res, {
        message: 'invlaid promocode',
        success: false,
        error: true,
      });
    }
    return responseGenerator(200, res, {
      success: true,
      error: false,
      message: 'promocoe applied',
      data: {
        promocode_for: promo.promocode_for,
        Discount_type: promo.Discount_type,
        Discount: promo.Discount,
        Max_discount_amount: promo.Max_discount_amount,
        Min_purchase_amount: promo.Min_purchase_amount,
        promocode_id: promo.promo_code_id,
      },
    });
  } catch (err) {
    return next(err);
  }
};

module.exports = check_promo_code_controller;
