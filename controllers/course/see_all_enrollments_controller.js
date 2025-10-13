const prisma = require('../../config/db');
const responseGenerator = require('../../utils/responseGenerator');

const see_all_enrollments_controller = async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const page_size = 100;
  const skip = (page - 1) * page_size;
  try {
    const enrollments = await prisma.enrollment.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        payment: true,
        course: true,
      },
      take: page_size,
      skip,
    });
    // ============= response
    return responseGenerator(200, res, {
      message: 'all enrollment found',
      error: false,
      success: true,
      enrollments,
    });
  } catch (error) {
    error.message = 'failed to load enrollments';
    error.status = 500;
    return next(error);
  }
};

module.exports = see_all_enrollments_controller;
