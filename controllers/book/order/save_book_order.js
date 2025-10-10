const shortid = require('shortid');
const prisma = require('../../../config/db');
const save_order_object_validation_schema = require('./save_order_object_validation');
const validate_schema = require('../../../validators/utils/validate_schema');
const save_book_order = async (material_details, next) => {
  try {
    const { success, message, errors } = validate_schema(
      save_order_object_validation_schema,
      material_details
    );

    //     schema validation error and thorugh response
    if (!success) {
      return { success, message, error: true, errors };
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
      after_calulated_data,
      promo_code_id,
    } = material_details || {};

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
        status: after_calulated_data?.status
          ? after_calulated_data?.status
          : 'pending',
        user: {
          connect: { user_id },
        },
        payment: {
          create: {
            payment_id: shortid.generate(),
            meterial_price: after_calulated_data.original_amount,
            amount: after_calulated_data.after_discounted_amount, // after discount
            discount_amount: after_calulated_data.discount, // discount amount
            paid_amount: after_calulated_data.after_discounted_amount,
            due_amount: after_calulated_data.due_amount,
            user_id,
            Txn_ID,
            // ✅ Only connect promo_code if it exists
            ...(promo_code_id
              ? {
                  promo_code: {
                    connect: { promo_code_id },
                  },
                  promo_code_id,
                }
              : {
                  promo_code_id: null, // no code used
                }),
            promo_code_id,
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
        errors,
      };
    }

    // =============== return : if data saved
    return {
      success: true,
      error: false,
      message: 'order placed successfully',
      errors,
    };
  } catch (error) {
    return next(error);
  }
};

module.exports = save_book_order;
