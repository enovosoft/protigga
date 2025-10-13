const prisma = require('../../../config/db');
const responseGenerator = require('../../../utils/responseGenerator');

const see_all_book_orders = async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const page_size = 100;
  const skip = (page - 1) * page_size;
  try {
    const orders = await prisma.book_order.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        payment: true,
        book: true,
      },
      take: page_size,
      skip,
    });
    // ============= response
    return responseGenerator(200, res, {
      message: 'all orders found',
      error: false,
      success: true,
      orders,
    });
  } catch (error) {
    error.message = 'failed to load orders';
    error.status = 500;
    return next(error);
  }
};

module.exports = see_all_book_orders;
