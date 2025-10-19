const prisma = require('../../config/db');
const checkUserExists = require('../../utils/checkUserExists');
const responseGenerator = require('../../utils/responseGenerator');
const transaction_id_generator = require('../../utils/transaction_id_generator');
const save_enrollment = require('../course/utils/save_enrollment');

const manual_enrollment_controller = async (req, res, next) => {
  try {
    let {
      enrollment_type,
      phone,
      course_id,
      expiry_date,
      product_price,
      discount_amount,
      paid_amount,
      method,
      remarks,
      payment_status,
      enrollment_status,
      Txn_ID,
      wp_number,
      fb_name,
    } = req.body || {};

    // ------------ search by user
    const { exist, user } = await checkUserExists({ phone });
    if (!exist)
      return responseGenerator(404, res, {
        message: 'user not found',
        error: true,
        success: false,
      });

    //========================= enrollment create
    //     ------------- create required value
    Txn_ID = `${Txn_ID || ''}${
      Txn_ID ? '-' : ''
    }MANUAL-${transaction_id_generator()}`;
    const { success, error, message } = await save_enrollment(
      {
        user_id: user?.user_id,
        Txn_ID,
        wp_number,
        fb_name,
        product_price,
        address: '',
        product_id: course_id,
        method,
        paymentGateway: method,
        payment_status,
        enrollment_status,
        after_calulated_data: {
          product_price,
          product_price_with_quantity: product_price,
          calculated_amount: product_price,
          original_amount: product_price,
          after_discounted_amount: product_price - discount_amount,
          paid_amount,
          discount: discount_amount,
          due_amount: product_price - discount_amount - paid_amount,
        },
        remarks,
        expiry_date,
        enrollment_type,
      },
      res,
      next
    );

    //     check and presponse
    if (success) {
      return responseGenerator(success ? 201 : 500, res, {
        message: success
          ? 'course enrollment successfully'
          : 'faile to enroll course',
        success,
        error,
      });
    }

    return responseGenerator(200, res, {
      message,
      success,
      error,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = manual_enrollment_controller;
