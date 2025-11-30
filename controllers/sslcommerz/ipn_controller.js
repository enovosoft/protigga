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
        `${process.env.FRONTEND_URL}/payment/fail?message=invalid payment information`
      );

    // =================== if payment valid
    if (!payment_details.val_id && status === 'VALID') {
      if (String(meterial_type).toLowerCase() === 'book') {
        // ============= confirm: book order
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

    return res.status(200).json({ message: 'IPN received', validation });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};

module.exports = ipn_controller;
