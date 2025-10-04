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
