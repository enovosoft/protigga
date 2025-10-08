const prisma = require('../../config/db');
const responseGenerator = require('../../utils/responseGenerator');
const find_course_by_slug = require('./utils/find_course_by_slug');

const delete_course_controller = async (req, res, next) => {
  try {
    const { slug } = req.params;
    if (!slug) {
      return responseGenerator(400, res, {
        message: 'Invalid request',
        success: false,
        error: true,
      });
    }

    const { exist } = await find_course_by_slug(slug);
    if (!exist) {
      return responseGenerator(404, res, {
        message: 'Course not found',
        error: true,
        success: false,
      });
    }

    // Delete both course_details and course in a transaction
    const [deleted_course_details, deleted_course] = await prisma.$transaction([
      prisma.course_details.delete({ where: { slug } }),
      prisma.course.delete({ where: { slug } }),
    ]);

    return responseGenerator(200, res, {
      message: 'Successfully deleted',
      error: false,
      success: true,
      data: { deleted_course, deleted_course_details },
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = delete_course_controller;
