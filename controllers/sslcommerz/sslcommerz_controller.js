const shortid = require('shortid');
const { initPayment, validatePayment } = require('../../utils/payment.utils');
const responseGenerator = require('../../utils/responseGenerator');
const save_book_order = require('../book/order/save_book_order');
const transaction_id_generator = require('../../utils/transaction_id_generator');

require('dotenv').config();

const createPayment = async (req, res, next) => {
  try {
    const { amount, customer, meterial_type, delevery_type, meterial_details } =
      req.body;
    // ========== transection id: as tran_id: generate
    const tran_id = transaction_id_generator();
    // make decision: by meterial_type, by delevery_type
    // ==================== decision : by meterial type -> and create order or enrollment
    let is_saved_data = false;
    let message_ = null;
    meterial_details.Txn_ID = tran_id;
    if (String(meterial_type).toLowerCase() === 'book') {
      // ---------------- create an order: book
      const { success, message } = await save_book_order(
        meterial_details,
        res,
        next
      );
      is_saved_data = success;
      message_ = message;
    }

    if (!is_saved_data)
      return responseGenerator(400, res, {
        success: is_saved_data,
        message: message_,
        error: true,
      });

    const data = {
      total_amount: amount,
      currency: 'BDT',
      tran_id: tran_id, // unique transaction id
      success_url: `${process.env.BASE_URL}/api/v1/payment/success?tran_id=${tran_id}&meterial_type=${meterial_type}`,
      fail_url: `${process.env.BASE_URL}/api/v1/payment/fail?tran_id=${tran_id}&meterial_type=${meterial_type}`,
      cancel_url: `${process.env.BASE_URL}/api/v1/payment/cancel?tran_id=${tran_id}&meterial_type=${meterial_type}`,
      ipn_url: `${process.env.BASE_URL}/api/v1/payment/ipn`,
      shipping_method: 'NO',
      product_name: 'Course / Book Purchase',
      product_category: 'Education',
      product_profile: 'general',
      cus_name: customer.name,
      cus_email: customer.email,
      cus_add1: customer.address,
      cus_phone: customer.phone,
    };

    const apiResponse = await initPayment(data);
    return responseGenerator(200, res, {
      status: 'SUCCESS',
      payment_url: apiResponse.GatewayPageURL,
      error: false,
      success: true,
    });
  } catch (error) {
    return responseGenerator(500, res, {
      status: 'FAILED',
      error: true,
      success: false,
      message: error.message,
    });
  }
};

const ipnListener = async (req, res) => {
  try {
    const { val_id } = req.body;
    const validation = await validatePayment(val_id);
    console.log('IPN Validated:', validation);
    res.status(200).json({ message: 'IPN received', validation });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

module.exports = {
  createPayment,
  ipnListener,
};
