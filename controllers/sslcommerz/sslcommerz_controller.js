const { initPayment } = require('../../utils/payment.utils');
const responseGenerator = require('../../utils/responseGenerator');
const save_book_order = require('../book/order/save_book_order');
const transaction_id_generator = require('../../utils/transaction_id_generator');

const save_enrollment = require('../course/utils/save_enrollment');
const update_book_order = require('../book/order/utils/update_book_order');
const update_enrollment_property = require('../course/utils/update_enrollment_property');
const price_calculation = require('../promo_code/utils/price_calculation');

const createPayment = async (req, res, next) => {
  try {
    const {
      meterial_type,
      delevery_type,
      inside_dhaka,
      outside_dhaka,
      sundarban_courier,
      meterial_details,
      address,
      alternative_phone,
    } = req.body;

    // ========== transection id: as tran_id: generate
    const tran_id = transaction_id_generator();
    // ============= check promocode and calculation
    const after_calulated_data = await price_calculation(
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
    let errors = null;
    let created_order = null;
    let enrollme_course_details = null;
    meterial_details.Txn_ID = tran_id;
    meterial_details.address = address;
    meterial_details.alternative_phone = alternative_phone;
    meterial_details.user_id = user?.user_id;
    meterial_details.product_price = parseFloat(
      after_calulated_data.product_price
    );
    meterial_details.after_calulated_data = after_calulated_data;
    if (String(meterial_type).toLowerCase() === 'book') {
      // ---------------- create an order: book
      const {
        success,
        message,
        errors: errors_,
        created_order: created_order_,
      } = await save_book_order(meterial_details, next);
      is_saved_data = success;
      message_ = message;
      errors = errors_;
      created_order = created_order_;
    }
    if (String(meterial_type).toLowerCase() === 'course') {
      // ---------------- create an order: book
      const { success, message, enrollment_id } = await save_enrollment(
        meterial_details,
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
        errors,
      });
    // ============== if amount zero

    if (after_calulated_data?.paid_amount === 0) {
      // -------- update book order
      if (String(meterial_type).toLowerCase() === 'book')
        await update_book_order(
          { order_id: created_order?.order_id },
          { status: 'confirmed', confirmed: true }
        );
      // ---------- update enrollment
      if (String(meterial_type).toLowerCase() === 'course')
        await update_enrollment_property(
          { enrollment_id: enrollment_id_ },
          { enrollment_status: 'confirmed' }
        );

      return responseGenerator(200, res, {
        status: 'SUCCESS',
        error: false,
        success: true,
        payment_url: `${process.env.FRONTEND_URL}/payment/success`,
      });
    }
    // ---------- sslcommerz
    const data = {
      total_amount: Number(after_calulated_data.paid_amount),
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
      cus_add1: req.body?.address || '-',
      ship_name: user?.name || '-',
      ship_add1: req.body?.address || '-',
      ship_city: req.body?.address?.split(',')[1] || '-',
      ship_state: req.body?.address?.split(',')[2] || '-',
      ship_postcode: req.body?.address?.split(',')[4] || '-',
      ship_country: 'Bangladesh',
    };

    const apiResponse = await initPayment(data);
    console.log(apiResponse);

    return responseGenerator(200, res, {
      status: 'SUCCESS',
      error: false,
      success: true,
      payment_url: apiResponse?.GatewayPageURL,
    });
  } catch (error) {
    console.log(error);
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
    return res.status(200).json({ message: 'IPN received', validation });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};

module.exports = {
  createPayment,
  ipnListener,
};
