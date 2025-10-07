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
      alternative_phone,
      quantity,
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
    const order_id = shortid.generate();
    const created_order = await prisma.book_order.create({
      data: {
        order_id,
        product_name,
        product_price,
        alternative_phone,
        quantity,
        Txn_ID,
        address,
        user: {
          connect: { user_id },
        },
        payment: {
          create: {
            payment_id: shortid.generate(),
            user_id,
            discount_amount: 1000,
            amount: product_price,
            paid_amount: product_price,
            due_amount: 0,
            Txn_ID,
            purpose: 'book order',
            remarks: 'Book order',
          },
        },
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
