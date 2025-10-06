const prisma = require('../../../../config/db');

const find_book_order = async (data, selectors) => {
  try {
    const ordered_book = await prisma.book_order.findFirst({
      where: {
        ...data,
      },
      ...selectors,
    });
    return {
      exists: ordered_book?.Txn_ID ? true : false,
      ordered_book: ordered_book?.Txn_ID ? ordered_book : null,
    };
  } catch (error) {
    throw new Error(error);
  }
};

module.exports = find_book_order;
