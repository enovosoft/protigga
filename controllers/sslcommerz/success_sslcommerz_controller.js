const shortid = require('shortid');
const responseGenerator = require('../../utils/responseGenerator');
const save_payment_info_on_db = require('../../utils/save_payment_info_on_db');
const find_book_order = require('../book/order/utils/find_book_order');
const update_book_order = require('../book/order/utils/update_book_order');

const success_sslcommerz_controller = async (req, res) => {
  const tran_id = req.query.tran_id || '';
  const meterial_type = req.query.meterial_type || '';

  // ============= confirm: book order
  if (String(meterial_type).toLowerCase() === 'book') {
    // ========== find: by tran_id
    const { ordered_book } = await find_book_order({ Txn_ID: tran_id });
    // ================ check and response
    if (!ordered_book.Txn_ID)
      return responseGenerator(404, res, {
        success: false,
        error: true,
        message: 'Transaction not found',
      });

    //=========== check: check and update status and confiremed property also save payment info
    if (ordered_book?.Txn_ID) {
      await update_book_order(
        { order_id: ordered_book.order_id },
        { status: 'confirmed', confirmed: false }
      );
      // ----------------- save payment on Payment table
    }
  }

  return res.redirect(`${process.env.FRONTEND_URL}/payment/success`);
};

module.exports = success_sslcommerz_controller;
