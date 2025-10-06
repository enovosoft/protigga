const shortid = require('shortid');
const prisma = require('../../../config/db');
const responseGenerator = require('../../../utils/responseGenerator');

const save_order_object_validation_schema = require('./save_order_object_validation');
const validate_schema = require('../../../validators/utils/validate_schema');
const checkUserExists = require('../../../utils/checkUserExists');

const save_book_order = async (material_details, res, next) => {
  try {
    const { success, message, errors } = validate_schema(
      save_order_object_validation_schema,
      material_details
    );
    //     schema validation error and thorugh response
    if (!success) {
      return responseGenerator(400, res, {
        success,
        message,
        error: true,
        errors,
      });
    }
    // ================= Extract data
    const {
      product_name,
      user_id,
      product_price,
      discount,
      quantity,
      promo_code,
      promo_code_id,
      address,
      Txn_ID,
    } = material_details || {};
    // ============== check: user
    const { exist } = await checkUserExists({ user_id });
    if (!exist)
      return responseGenerator(404, res, {
        message: 'Please registration first',
        error: true,
        success: false,
      });
    //     ================= save order
    const created_order = await prisma.book_order.create({
      data: {
        order_id: shortid.generate(),
        product_name,
        user_id,
        product_price,
        discount,
        quantity,
        promo_code,
        promo_code_id,
        address,
        Txn_ID,
        payment_method: 'sslcommerz',
      },
    });
    // =============== return : if failed to data saved
    if (!created_order?.order_id) {
      return {
        success: false,
        error: true,
        message: 'faile to place order',
      };
    }

    // =============== return : if data saved
    return {
      success: true,
      error: false,
      message: 'order placed successfully',
    };
  } catch (error) {
    return next(error);
  }
};

module.exports = save_book_order;
