const prisma = require('../../../../config/db');

const update_book_order = async (
  finder_obj = {},
  update_obj = {},
  payment_update_obj = {}
) => {
  try {
    const updated_order = await prisma.book_order.update({
      where: {
        ...finder_obj,
      },
      data: {
        payment: {
          update: {
            status:
              update_obj.status === 'confirmed'
                ? 'SUCCESS'
                : update_obj.status === 'cancelled'
                ? 'CANCELLED'
                : update_obj.status === 'failed'
                ? 'FAILED'
                : 'PENDING',
            ...payment_update_obj,
          },
        },
        ...update_obj,
      },
    });
    //     ======= return
    return {
      exist: updated_order?.Txn_ID ? true : false,
      success: updated_order?.Txn_ID ? true : false,
      updated_order: updated_order?.Txn_ID ? updated_order : null,
    };
  } catch (error) {
    throw new Error(error);
  }
};

module.exports = update_book_order;
