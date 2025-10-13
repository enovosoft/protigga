const prisma = require('../../config/db');
const responseGenerator = require('../../utils/responseGenerator');
const find_book_order = require('../book/order/utils/find_book_order');
const update_book_order = require('../book/order/utils/update_book_order');
const update_enrollment_property = require('../course/utils/update_enrollment_property');

const cancel_sslcommerz_controller = async (req, res) => {
  const {
    tran_id,
    tran_date,
    card_type,
    card_issuer,
    currency,
    store_amount,
    card_category,
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
  // ============= cancelled: book order
  if (String(meterial_type).toLowerCase() === 'book') {
    //=========== check: check and update status and confiremed property
    if (payment_details?.Txn_ID) {
      await update_book_order(
        { order_id: payment_details.book_order_id },
        { status: 'cancelled', confirmed: false },
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
  // ============= cencelled: course enrollment
  if (String(meterial_type).toLowerCase() === 'course') {
    if (enrollment_id == 'undefined') {
      return res.send(
        `<h1 style="text-align:center">Warning for rules break</h1><br/><h3 style="color:red; text-align:center">Please follow our website rules, don't misuse it</h3>`
      );
    }
    if (payment_details?.Txn_ID) {
      //=========== check: check and update status and confiremed property also save payment info
      await update_enrollment_property(
        { enrollment_id },
        { enrollment_status: 'cancelled' },
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

  return res.redirect(`${process.env.FRONTEND_URL}/payment/cancel`);
};

module.exports = cancel_sslcommerz_controller;
