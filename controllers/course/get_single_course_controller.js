const prisma = require('../../config/db');
const responseGenerator = require('../../utils/responseGenerator');

const get_single_course_controller = async (req, res, next) => {
  try {
    const { slug } = req.params || '';
    const course = await prisma.course.findFirst({
      where: {
        slug,
        is_deleted: false,
      },
      include: {
        course_details: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    //     --------- response
    return responseGenerator(200, res, {
      message: course?.course_id ? 'Course found' : 'course not found',
      success: course?.course_id ? true : false,
      error: !course?.course_id ? true : false,
      course,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = get_single_course_controller;
