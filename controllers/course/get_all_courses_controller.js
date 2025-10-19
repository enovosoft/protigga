const prisma = require('../../config/db');
const responseGenerator = require('../../utils/responseGenerator');

const get_all_courses_controller = async (req, res, next) => {
  try {
    const courses = await prisma.course.findMany({
      select: {
        course_id: true,
        batch: true,
        course_title: true,
        slug: true,
        price: true,
        thumbnail: true,
        exams: true,
      },
      where: { is_deleted: false },
    });

    //     --------- response
    return responseGenerator(200, res, {
      message: courses.length > 0 ? 'Course found' : 'Not course available',
      success: true,
      error: false,
      courses,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = get_all_courses_controller;
