const prisma = require('../../config/db');
const bcrypt = require('bcrypt');
const responseGenerator = require('../../utils/responseGenerator');
const check_promo_code_controller = async (req, res, next) => {
  try {
    const { promocode, promocode_for } = req.body;

    // Fetch the promo code from DB
    const promo = await prisma.promo_code.findFirst({
      where: {
        promo_code: promocode,
        promocode_for,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // return console.log(origina_promo_code);
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

    return responseGenerator(200, res, {
      success: true,
      error: false,
      message: '',
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
