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
      });
  } catch (error) {
    return next(error);
  }
};

module.exports = update_promocode_controller;
