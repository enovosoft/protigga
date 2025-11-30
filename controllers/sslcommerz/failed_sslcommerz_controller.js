const prisma = require('../../config/db');
const update_book_order = require('../book/order/utils/update_book_order');
const update_enrollment_property = require('../course/utils/update_enrollment_property');
//
const failed_sslcommerz_controller = async (req, res) => {
  const {
    tran_id,
    tran_date,
    card_type,
    card_issuer,
    currency,
    store_amount,
    card_category,
    status,
  } = req.body;

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
  if (!payment_details.val_id && status === 'FAILED') {
    if (String(meterial_type).toLowerCase() === 'book') {
      // ============= confirm: book order
      //=========== check: check and update status and confiremed property
      if (payment_details?.Txn_ID) {
        await update_book_order(
          { order_id: payment_details.book_order_id },
          { status: 'failed', confirmed: false },
          {
            tran_date,
            card_type,
            card_issuer,
            currency,
            store_amount,
            card_category,
          }
        );
      }
    }
    // ============= cencelled: course enrollment
    if (String(meterial_type).toLowerCase() === 'course') {
      if (payment_details?.Txn_ID) {
        //=========== check: check and update status and confiremed property also save payment info
        await update_enrollment_property(
          { enrollment_id: payment_details?.enrollment_id },
          { enrollment_status: 'failed' },
          {
            tran_id,
            tran_date,
            card_type,
            card_issuer,
            currency,
            store_amount,
            card_category,
          }
        );
      }
    }
  }
  return res.redirect(`${process.env.FRONTEND_URL}/payment/fail`);
};

module.exports = failed_sslcommerz_controller;
