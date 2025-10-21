const prisma = require('../../config/db');
const responseGenerator = require('../../utils/responseGenerator');

const get_single_user_details_controller = async (req, res, next) => {
  try {
    const decoded_user = req.decoded_user;
    //     ======== search
    const user = await prisma.user.findFirst({
      where: { user_id: decoded_user?.user_id },
      include: {
        payments: {
          select: {
            course_enrollment: true,
            book_order: true,
          },
        },
        enrollments: {
          select: {
            payment: true,
            course: true,
          },
        },
        book_orders: {
          select: {
            payment: true,
            book: true,
          },
        },
      },
    });

    //     check : if exist
    if (!user?.user_id)
      return responseGenerator(404, res, {
        message: 'user not found',
        success: false,
        error: true,
      });
    if (user?.user_id)
      return responseGenerator(200, res, {
        message: 'user found',
        success: true,
        error: false,
        user,
      });
  } catch (error) {
    return next(error);
  }
};

module.exports = get_single_user_details_controller;
