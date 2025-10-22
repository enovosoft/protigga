const shortid = require('shortid');
const prisma = require('../config/db');

const save_payment_info_on_db = async (payment_data) => {
  try {
    // =========== ::
    const {
      user_id,

      paid_amount,
      due_amount,
      method,
      Txn_ID,
      purpose,
      referenceId, // it will be book_oder_id, enrollment_id
      remarks, // for note
    } = payment_data;
    const created_payment = await prisma.payment.create({
      data: {
        payment_id: shortid.generate(),
        user_id,

        paid_amount,
        due_amount,
        status: 'SUCCESS',
        method,
        Txn_ID,
        purpose,
        referenceId,
        remarks,
      },
    });
    return {
      success: created_payment?.payment_id ? true : false,
      payment_info: created_payment?.payment_id ? created_payment : null,
    };
  } catch (error) {
    throw new Error(error);
  }
};

module.exports = save_payment_info_on_db;
