const prisma = require('../../config/db');
const responseGenerator = require('../../utils/responseGenerator');

const see_all_enrollments_controller = async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const page_size = 100;
  const course_id = req.query.book_id || '';
  const start_date = req.query.start_date || '';
  const enrollment_type = req.query.enrollment_type || '';
  const end_date = req.query.end_date || new Date();
  const skip = (page - 1) * page_size;
  try {
    let whereCondition = {};
    if (course_id) {
      whereCondition.course_id = course_id;
    }
    if (enrollment_type) {
      whereCondition.enrollment_type = enrollment_type; // online or hybrid
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

    const enrollments = await prisma.enrollment.findMany({
      where: whereCondition,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        payment: true,
        course: true,
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
    // ============== find all courses
    const courses = await prisma.course.findMany();
    // ============= response
    return responseGenerator(200, res, {
      message: 'all enrollment found',
      error: false,
      success: true,
      enrollments,
      courses,
      total_page: Math.ceil(total_data_size / page_size),
      curr_page: page,
      item_per_page: page_size,
    });
  } catch (error) {
    error.message = 'failed to load enrollments';
    error.status = 500;
    return next(error);
  }
};

module.exports = see_all_enrollments_controller;
