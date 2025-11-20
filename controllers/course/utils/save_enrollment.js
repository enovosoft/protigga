const shortid = require('shortid');
const prisma = require('../../../config/db');
const save_enromment_validation_schema = require('./save_enrollment_validation');
const validate_schema = require('../../../validators/utils/validate_schema');
const responseGenerator = require('../../../utils/responseGenerator');

const save_enrollment = async (material_details = {}, res, next) => {
  try {
    const { success, message, errors } = validate_schema(
      save_enromment_validation_schema,
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
    // ================= searching course with course_details
    const course_data = await prisma.course.findUnique({
      where: { course_id: material_details.product_id },
      include: { course_details: true },
    });

    // check and response
    if (!course_data?.course_id)
      return responseGenerator(404, res, {
        message: 'course not found',
        error: true,
        succc: false,
      });

    // ================= Extract data
    const {
      user_id,
      Txn_ID,
      after_calulated_data,
      promo_code_id,
      enrollment_type = 'online',
      wp_number = '--',
      fb_name = '--',
    } = material_details || {};

    // ===================== check: is already enrolled course by user
    const enrollment_data = await prisma.enrollment.findFirst({
      where: {
        user_id,
        course_id: material_details.product_id,
        enrollment_status: 'success',
        payment: {
          status: 'SUCCESS',
        },
      },
      include: {
        payment: true,
      },
    });

    //=============== reponse back for already enrolled course
    if (enrollment_data?.enrollment_id) {
      return {
        success: false,
        error: true,
        message: `You have already enrolled this course. please continue this course from your dashboard`,
      };
    }
    //     ================= save order
    const enrollment_id = shortid.generate();

    const created_enrollment = await prisma.enrollment.create({
      data: {
        enrollment_id,
        enrollment_type,
        course: {
          connect: {
            course_id: material_details.product_id,
          },
        },
        user: {
          connect: { user_id },
        },
        expiry_date: material_details?.expiry_date
          ? material_details?.expiry_date
          : course_data.course_details.expired_date,
        is_blocked: false,
        status: 'active',
        wp_number,
        address: material_details?.address || '_-_',
        fb_name,
        enrollment_status: material_details?.enrollment_status || 'pending',
        payment: {
          create: {
            payment_id: shortid.generate(),
            meterial_price: after_calulated_data.product_price,
            product_price_with_quantity:
              after_calulated_data.product_price_with_quantity,
            // amount: after_calulated_data.calculated_amount, // after discount
            discount_amount: after_calulated_data.discount, // discount amount
            paid_amount: after_calulated_data?.paid_amount
              ? after_calulated_data?.paid_amount
              : after_calulated_data.paid_amount,
            due_amount: after_calulated_data.due_amount,
            willCustomerGetAmount: after_calulated_data.willCustomerGetAmount,
            customer_receivable_amount:
              after_calulated_data.customer_receivable_amount,
            delevery_charge: after_calulated_data.delevery_charge,
            advance_charge_amount: after_calulated_data.advance_charge_amount,
            user_id,
            Txn_ID,
            status: material_details?.payment_status || 'PENDING',
            method: material_details?.method || 'SSL_COMMERZ',
            paymentGateway: material_details?.paymentGateway || 'SSL_COMMERZ',
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
            purpose: 'online course purchase',
            remarks: material_details?.remarks
              ? material_details?.remarks
              : 'online course purchase',
          },
        },
      },
    });

    // =============== return : if failed to data saved
    if (!created_enrollment?.enrollment_id) {
      return {
        success: false,
        error: true,
        message: 'faile to place order',
        // user: user?.user_id ? user : null,
      };
    }

    // =============== return : if data saved
    return {
      success: true,
      error: false,
      message: 'Order placed successfully. please wait for payment',
      // user: user?.user_id ? user : null,
      enrollment_id,
      enrollme_course_details: created_enrollment,
    };
  } catch (error) {
    return next(error);
  }
};

module.exports = save_enrollment;
