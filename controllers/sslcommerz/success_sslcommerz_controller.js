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
    const product_id = req.query.product_id || '';
    const enrollment_id = req.query.enrollment_id || '';
    // ========== find: by tran_id
    const payment_details = await prisma.payment.findFirst({
      where: {
        Txn_ID: tran_id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // ================ check and response
    if (!payment_details.Txn_ID)
      return res.send(
        `<h1 style="text-align:center">Not found</h1><br/><h3 style="color:red; text-align:center">Transection</h3>`
      );

    if (!payment_details.val_id && status === 'VALID') {
      if (String(meterial_type).toLowerCase() === 'book') {
        // ============= confirm: book order
        //=========== check: check and update status and confiremed property also save payment info
        if (payment_details?.Txn_ID) {
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
          // ----------------- save payment on Payment table
        }
      }
      // ============= confirm: course enrollment
      else if (String(meterial_type).toLowerCase() === 'course') {
        if (enrollment_id == 'undefined') {
          return res.send(
            `<h1 style="text-align:center">Warning for rules break</h1><br/><h3 style="color:red; text-align:center">Please follow our website rules, don't misuse it</h3>`
          );
        }
        if (payment_details?.Txn_ID) {
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
          // ----------------- save payment on Payment table
        }
      }
      return res.redirect(`${process.env.FRONTEND_URL}/payment/success`);
    } else {
      return res.redirect(`${process.env.FRONTEND_URL}/payment/fail`);
    }
  } catch (error) {
    console.log(error);
    return next(error);
  }
};

module.exports = success_sslcommerz_controller;
