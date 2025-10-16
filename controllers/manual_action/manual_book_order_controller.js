const shortid = require('shortid');
const save_book_order = require('../book/order/save_book_order');
const responseGenerator = require('../../utils/responseGenerator');
const transaction_id_generator = require('../../utils/transaction_id_generator');
const checkUserExists = require('../../utils/checkUserExists');
const manual_book_order_controller = async (req, res, next) => {
  try {
    const {
      phone,
      product_price,
      quantity,
      address,
      alternative_phone,
      discount_amount,
      due_amount,
      after_discounted_amount,
      discount,
      book_order_status,
      payment_status,
      book_id,
    } = req.body || {};

    // ------------ search by user
    const { exist, user } = await checkUserExists({ phone });
    if (!exist)
      return responseGenerator(404, res, {
        message: 'user not found',
        error: true,
        success: false,
      });

    const { success, error, errors } = await save_book_order(
      {
        user_id: user.user_id,
        product_id: book_id,
        product_price,
        alternative_phone,
        quantity,
        address,
        Txn_ID: `MANUAL-${transaction_id_generator()}`,
        after_calulated_data: {
          original_amount: product_price,
          discount_amount,
          discount,
          after_discounted_amount,
          due_amount,
          status: book_order_status,
          payment_status,
        },
      },
      next
    );
    return responseGenerator(success ? 201 : 500, res, {
      message: success ? 'Order saved' : 'failed or save order',
      success,
      error,
      errors,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = manual_book_order_controller;
