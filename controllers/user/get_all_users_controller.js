const prisma = require('../../config/db');
const responseGenerator = require('../../utils/responseGenerator');

const get_all_users_controller = async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const page_size = 100;
  const skip = (page - 1) * page_size;

  try {
    const users = await prisma.user.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        user_id: true,
        name: true,
        phone: true,
        createdAt: true,
        updatedAt: true,
        is_verified: true,
        is_blocked: true,
        // relation data
        payments: {
          select: { course_enrollment: true, book_order: true },
        },
        enrollments: {
          select: { payment: true, course: true },
        },
        book_orders: {
          select: { payment: true, book: true },
        },
      },
      take: page_size,
      skip,
    });

    // ============= response
    return responseGenerator(200, res, {
      message: 'all data found',
      error: false,
      success: true,
      users,
    });
  } catch (error) {
    console.log(error);
    error.message = 'failed to load user data';
    error.status = 500;
    return next(error);
  }
};

module.exports = get_all_users_controller;
