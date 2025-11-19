const update_book_order = require('../book/order/utils/update_book_order');
const prisma = require('../../config/db');
const update_enrollment_property = require('../course/utils/update_enrollment_property');

const success_sslcommerz_controller = async (req, res, next) => {
  try {
    const {
      tran_id,
      tran_date,
      card_type,
      card_issuer,
      currency,
      store_amount,
      card_category,
    } = req.body;
    const { status, val_id } = req.sslValidated;
    const meterial_type = req.query.meterial_type || '';
    const enrollment_id = req.query.enrollment_id || '';
    // ========== find: by tran_id
    const payment_details = await prisma.payment.findUnique({
      where: {
        Txn_ID: tran_id,
      },
    });

    // ================ check and response
    if (!payment_details?.Txn_ID)
      return res.redirect(
        `${process.env.FRONTEND_URL}/payment/fail?message=invalid payment information`
      );

    if (!payment_details.val_id && status === 'VALID') {
      // ====== check
      if (String(meterial_type).toLowerCase() === 'book') {
        // ============= confirm: book order
        //=========== check: check and update status and confiremed property also save payment info
        await update_book_order(
          { order_id: payment_details.book_order_id },
          { status: 'confirmed', confirmed: true },
          {
            tran_date,
            card_type,
            card_issuer,
            currency,
            store_amount,
            card_category,
            val_id,
          }
        );
      }
      // ============= confirm: course enrollment
      else if (String(meterial_type).toLowerCase() === 'course') {
        if (enrollment_id == 'undefined') {
          return res.redirect(
            `${process.env.FRONTEND_URL}/payment/fail?message=Warning for rules break. Please follow our website rules, don't missuse it`
          );
        }

        //=========== check: check and update status and confiremed property also save payment info
        await update_enrollment_property(
          { enrollment_id },
          { enrollment_status: 'confirmed' },
          {
            tran_date,
            card_type,
            card_issuer,
            currency,
            store_amount,
            card_category,
            val_id,
          }
        );
      }
      return res.redirect(`${process.env.FRONTEND_URL}/payment/success`);
    } else {
      return res.redirect(`${process.env.FRONTEND_URL}/payment/fail`);
    }
  } catch (error) {
    return next(error);
  }
};

module.exports = success_sslcommerz_controller;
