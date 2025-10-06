const responseGenerator = require('../../utils/responseGenerator');
const find_book_order = require('../book/order/utils/find_book_order');
const update_book_order = require('../book/order/utils/update_book_order');

const cancel_sslcommerz_controller = async (req, res) => {
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
    //=========== check: check and update status and confiremed property
    if (ordered_book?.Txn_ID) {
      await update_book_order(
        { order_id: ordered_book.order_id },
        { status: 'cancelled', confirmed: false }
      );
    }
  }

  return res.redirect(`${process.env.FRONTEND_URL}/payment/cancel`);
};

module.exports = cancel_sslcommerz_controller;
