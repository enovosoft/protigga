const prisma = require('../../../config/db');
const responseGenerator = require('../../../utils/responseGenerator');

const see_all_book_orders = async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const page_size = parseInt(req.query.page_size) || 20;
  const book_id = req.query.book_id || '';
  const start_date = req.query.start_date || '';
  const end_date = req.query.end_date || new Date();
  const skip = (page - 1) * page_size;
  try {
    let whereCondition = {};

    if (book_id) {
      whereCondition.book_id = book_id;
    }

    if (start_date && end_date) {
      whereCondition.createdAt = {
        gte: new Date(start_date),
        lte: new Date(end_date),
      };
    } else if (start_date) {
      whereCondition.createdAt = {
        gte: new Date(start_date),
      };
    } else if (end_date) {
      whereCondition.createdAt = {
        lte: new Date(end_date),
      };
    }

    const total_data_size = await prisma.book_order.count({
      where: whereCondition,
    });
    const orders = await prisma.book_order.findMany({
      where: whereCondition,
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
    });
    // -------- get all books
    const books = await prisma.book.findMany();
    // ============= response
    return responseGenerator(200, res, {
      message: 'all orders found',
      error: false,
      success: true,
      // books,
      orders,
      total_page: Math.floor(total_data_size / page_size),
      curr_page: page,
      item_per_page: page_size,
    });
  } catch (error) {
    console.log(error);
    error.message = 'failed to load orders';
    error.status = 500;
    return next(error);
  }
};

module.exports = see_all_book_orders;
