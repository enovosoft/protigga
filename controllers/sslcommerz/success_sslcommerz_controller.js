const prisma = require('../../config/db');
const responseGenerator = require('../../utils/responseGenerator');

const success_sslcommerz_controller = async (req, res) => {
  const tran_id = req.query.tran_id || '';
  const meterial_type = req.query.meterial_type || '';
  // ============= confirm: book order
  if (String(meterial_type).toLowerCase() === 'book') {
    // ========== find: by tran_id
    const ordered_book = await prisma.book_order.findFirst({
      where: {
        Txn_ID: tran_id,
      },
    });
    // ================ check and response
    if (!ordered_book.Txn_ID)
      return responseGenerator(404, res, {
        success: false,
        error: true,
        message: 'Transaction not found',
      });
    //=========== check:
    if (ordered_book?.Txn_ID) {
      await prisma.book_order.update({
        where: {
          order_id: ordered_book.order_id,
        },
        data: {
          status: 'confirmed',
          confirmed: false,
        },
      });
    }
  }

  return res.redirect(`${process.env.FRONTEND_URL}/payment/success`);
};

module.exports = success_sslcommerz_controller;
