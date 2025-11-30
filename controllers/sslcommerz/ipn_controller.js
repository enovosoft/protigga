const update_book_order = require('../book/order/utils/update_book_order');
const update_enrollment_property = require('../course/utils/update_enrollment_property');

const ipn_controller = async (req, res) => {
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
    // =============== find payment details
    const payment_details = await prisma.payment.findUnique({
      where: {
        Txn_ID: tran_id,
      },
      include: {
        book_order: true,
        course_enrollment: true,
      },
    });

    // if payment not found (redirect)
    if (!payment_details?.Txn_ID)
      return res.redirect(
        `${process.env.FRONTEND_URL}/payment/fail?message=invalid Txn_ID payment information`
      );

    // =================== if payment valid
    if (!payment_details.val_id && status === 'VALID') {
      if (String(meterial_type).toLowerCase() === 'book') {
        // ============= confirm: book order
        await update_book_order(
          { order_id: payment_details.book_order_id },
          { status: " 'confirmed'", confirmed: true },
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
      } else if (String(meterial_type).toLowerCase() === 'course') {
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
    }
    // ========================= if payment FAILED
    if (!payment_details.val_id && status === 'FAILED') {
      if (String(meterial_type).toLowerCase() === 'book') {
        // ----------------- confirm: book order
        // ---------------- check: check and update status and confiremed property
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
      // ============= failed: course enrollment
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

    // ======================= if payment cancelled
    if (!payment_details.val_id && status === 'CANCELLED') {
      // ------------------- cancelled: book order
      if (String(meterial_type).toLowerCase() === 'book') {
        // ---------------- check: check and update status and confiremed property
        if (payment_details?.Txn_ID) {
          await update_book_order(
            { order_id: payment_details.book_order_id },
            { status: 'cancelled', confirmed: false },
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
      // ----------------- cancelled: course enrollment
      if (String(meterial_type).toLowerCase() === 'course') {
        if (payment_details?.Txn_ID) {
          // ----------------- check: check and update status and confiremed property also save payment info
          await update_enrollment_property(
            { enrollment_id: payment_details?.enrollment_id },
            { enrollment_status: 'cancelled' },
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
    }

    return res.status(200).json({ message: 'IPN received', validation });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};

module.exports = ipn_controller;
