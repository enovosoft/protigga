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

    // Date logic
    if (start_date && end_date) {
      // end_date-কে দিনের শেষ পর্যন্ত সেট করুন
      const endDate = new Date(end_date);
      endDate.setHours(23, 59, 59, 999); // 23:59:59.999

      whereCondition.createdAt = {
        gte: new Date(start_date), // দিনের শুরু (00:00:00)
        lte: endDate, // দিনের শেষ (23:59:59)
      };
    } else if (start_date) {
      whereCondition.createdAt = {
        gte: new Date(start_date), // দিনের শুরু থেকে
      };
    } else if (end_date) {
      // end_date-কে দিনের শেষ পর্যন্ত সেট করুন
      const endDate = new Date(end_date);
      endDate.setHours(23, 59, 59, 999); // 23:59:59.999

      whereCondition.createdAt = {
        lte: endDate, // দিনের শেষ পর্যন্ত
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
      orders,
      total_page: Math.ceil(total_data_size / page_size),
      curr_page: page,
      item_per_page: page_size,
      books,
    });
  } catch (error) {
    error.message = 'failed to load orders';
    error.status = 500;
    return next(error);
  }
};

module.exports = see_all_book_orders;
