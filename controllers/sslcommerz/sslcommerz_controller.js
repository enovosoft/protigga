const { initPayment, validatePayment } = require('../../utils/payment.utils');
const responseGenerator = require('../../utils/responseGenerator');
const save_book_order = require('../book/order/save_book_order');
const transaction_id_generator = require('../../utils/transaction_id_generator');
const price_calculation_through_promocode = require('../promo_code/utils/price_calculation_through_promocode');
const save_enrollment = require('../course/utils/save_enrollment');

require('dotenv').config();

const createPayment = async (req, res, next) => {
  try {
    const {
      customer,
      meterial_type,
      delevery_type,
      inside_dhaka,
      outside_dhaka,
      sundarban_courier,
      meterial_details,
    } = req.body;
    // ========== transection id: as tran_id: generate
    const tran_id = transaction_id_generator();
    // ============= check promocode and calculation
    const after_calulated_data = await price_calculation_through_promocode(
      req.body,
      delevery_type,
      inside_dhaka,
      outside_dhaka,
      sundarban_courier,
      res
    );

    // // ============== check: user
    const user = req.decoded_user;

    // ==================== decision : by meterial type -> and create order or enrollment
    let is_saved_data = false;
    let message_ = null;
    let enrollment_id_ = null;
    meterial_details.Txn_ID = tran_id;
    meterial_details.product_price = parseFloat(
      after_calulated_data.after_discounted_amount
    );
    meterial_details.after_calulated_data = after_calulated_data;
    if (String(meterial_type).toLowerCase() === 'book') {
      // ---------------- create an order: book
      const { success, message } = await save_book_order(
        meterial_details,
        user,
        res,
        next
      );
      is_saved_data = success;
      message_ = message;
    }
    if (String(meterial_type).toLowerCase() === 'course') {
      // ---------------- create an order: book
      const { success, message, enrollment_id } = await save_enrollment(
        meterial_details,
        user,
        res,
        next
      );
      is_saved_data = success;
      message_ = message;
      enrollment_id_ = enrollment_id;
    }
    // ===============
    if (!is_saved_data)
      return responseGenerator(400, res, {
        success: is_saved_data,
        message: message_,
        error: true,
      });

    const data = {
      total_amount: Number(after_calulated_data.after_discounted_amount) || 0,
      currency: 'BDT',
      tran_id: tran_id, // unique transaction id
      success_url: `${process.env.BASE_URL}/api/v1/payment/success?tran_id=${tran_id}&meterial_type=${meterial_type}&product_id=${meterial_details.product_id}&enrollment_id=${enrollment_id_}`,
      fail_url: `${process.env.BASE_URL}/api/v1/payment/fail?tran_id=${tran_id}&meterial_type=${meterial_type}&product_id=${meterial_details.product_id}&enrollment_id=${enrollment_id_}`,
      cancel_url: `${process.env.BASE_URL}/api/v1/payment/cancel?tran_id=${tran_id}&meterial_type=${meterial_type}&product_id=${meterial_details.product_id}&enrollment_id=${enrollment_id_}`,
      ipn_url: `${process.env.BASE_URL}/api/v1/payment/ipn`,
      shipping_method:
        String(meterial_type).toLowerCase() === 'book' ? 'COURIER' : 'NO',
      product_name: after_calulated_data.meterial_name,
      product_category: 'Education',
      product_profile: meterial_type,
      cus_name: user.name,
      cus_phone: user.phone,
      cus_email: '-',
      cus_add1: '-',
      ship_name: '-',
      ship_add1: '-',
      ship_city: '-',
      ship_state: '-',
      ship_postcode: '0000',
      ship_country: 'Bangladesh',
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
