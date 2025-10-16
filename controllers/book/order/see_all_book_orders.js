const prisma = require('../../../config/db');
const responseGenerator = require('../../../utils/responseGenerator');

const see_all_book_orders = async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const page_size = parseInt(req.query.page_size) || 20;
  const skip = (page - 1) * page_size;
  try {
    const total_data_size = await prisma.book_order.count();
    const orders = await prisma.book_order.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        payment: true,
        book: true,
        user: {
          select: {
            name: true,
            phone: true,
          },
        },
      },
      take: page_size,
      skip,
      total_page: total_data_size / page_size,
      curr_page: page,
      item_per_page: page_size,
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
