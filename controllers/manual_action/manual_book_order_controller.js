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
    // ================= find transaction details
    const transection = await prisma.payment.findFirst({
      where: {
        Txn_ID,
      },
    });
    // ===== check:
    if (transection?.Txn_ID) {
      return responseGenerator(400, res, {
        message: 'please input unique TxnID',
        error: true,
        success: false,
      });
    }
    // ====================== find book details
    const { exist: exist_, book } = await find_book({ book_id });

    if (!exist_)
      return responseGenerator(404, res, {
        message: 'book not found',
        error: true,
        success: false,
      });
    // ========== delevery charge calculation
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
        product_price: Number(product_price) || 0,
        alternative_phone,
        quantity: quantity || 0,
        address: address || '--',
        Txn_ID: Txn_ID || `MANUAL-${transaction_id_generator()}`,
        after_calulated_data: {
          product_price: Number(product_price) || 0,
          discount_amount: discount_amount || 0,
          product_price_with_quantity:
            Number(product_price * quantity) - discount || 0,
          discount: discount || 0,
          // calculated_amount:
          //   Number(product_price * quantity - discount + delevery_charge) || 0,
          paid_amount: paid_amount || 0,
          delevery_charge: delevery_charge || 0,
          due_amount:
            parseFloat(product_price * quantity - (paid_amount + discount)) ||
            0,
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
