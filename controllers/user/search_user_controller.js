const prisma = require('../../config/db');
const responseGenerator = require('../../utils/responseGenerator');

const search_user_controller = async (req, res, next) => {
  try {
    const { user_id, name, phone } = req.query;

    let orConditions = [];

    if (user_id) orConditions.push({ user_id: { contains: user_id } });
    if (name) orConditions.push({ name: { contains: name } }); // case-sensitive; add mode if Prisma >=4.14
    if (phone) orConditions.push({ phone: { contains: phone } });

    if (orConditions.length === 0) {
      return null; // nothing to search
    }

    const user = await prisma.user.findMany({
      where: {
        OR: orConditions,
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
    });

    if (!user) {
      return responseGenerator(404, res, {
        message: 'User not found',
        error: true,
        success: false,
      });
    }

    return responseGenerator(200, res, {
      message: 'User found',
      error: false,
      success: true,
      data: user,
    });
  } catch (err) {
    return next(err);
  }
};

module.exports = search_user_controller;
