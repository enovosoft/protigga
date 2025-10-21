const shortid = require('shortid');
const save_book_order = require('../book/order/save_book_order');
const responseGenerator = require('../../utils/responseGenerator');
const transaction_id_generator = require('../../utils/transaction_id_generator');
const checkUserExists = require('../../utils/checkUserExists');
const prisma = require('../../config/db');
const find_book = require('../book/utils/find_book');
const manual_book_order_controller = async (req, res, next) => {
  try {
    const {
      phone,
      product_price,
      quantity,
      address,
      alternative_phone,
      discount_amount,
      paid_amount,
      discount,
      book_order_status,
      payment_status,
      book_id,
      Txn_ID,
      payment_method,
      inside_dhaka,
      outside_dhaka,
      sundarban_courier,
    } = req.body || {};
    // ------------ search by user
    const { exist, user } = await checkUserExists({ phone });
    if (!exist)
      return responseGenerator(404, res, {
        message: 'user not found',
        error: true,
        success: false,
      });

    // ====================== find book details
    const { exist: exist_, book } = await find_book({ book_id });

    if (!exist_)
      return responseGenerator(404, res, {
        message: 'book not found',
        error: true,
        success: false,
      });
    // ========== delevery charge calculation
    let ADVANCE_AMOUNT = Number(process.env.ADVANCE_AMOUNT);
    const OUTSIDE_DHAKA_CHARGE = Number(process.env.OUTSIDE_DHAKA_CHARGE);
    const INSIDE_DHAKA_CHARGE = Number(process.env.INSIDE_DHAKA_CHARGE);
    const SUNDORBAN_CHARGE = Number(process.env.SUNDORBAN_CHARGE);
    let delevery_charge = 60;
    if (inside_dhaka && !outside_dhaka && !sundarban_courier) {
      delevery_charge = INSIDE_DHAKA_CHARGE;
    } else if (outside_dhaka && !sundarban_courier && !inside_dhaka) {
      delevery_charge = OUTSIDE_DHAKA_CHARGE;
    } else if (sundarban_courier && !inside_dhaka && !outside_dhaka) {
      delevery_charge = SUNDORBAN_CHARGE;
    }

    const { success, error, errors } = await save_book_order(
      {
        user_id: user.user_id,
        product_id: book_id,
        product_price,
        alternative_phone,
        quantity,
        address,
        Txn_ID: Txn_ID || `MANUAL-${transaction_id_generator()}`,
        after_calulated_data: {
          product_price,
          discount_amount,
          product_price_with_quantity: product_price * quantity,
          discount,
          calculated_amount:
            product_price * quantity - discount + delevery_charge,
          paid_amount,
          delevery_charge,
          due_amount: product_price - paid_amount,
          status: book_order_status,
          payment_status,
          method: payment_method,
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
