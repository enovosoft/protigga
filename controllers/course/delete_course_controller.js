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

    const { exist, searched_data } = await find_course_by_slug({ slug });
    if (!exist) {
      return responseGenerator(404, res, {
        message: 'Course not found',
        error: true,
        success: false,
      });
    }

    const deleted_data = await prisma.course.update({
      where: {
        course_id: searched_data?.course_id,
      },
      data: {
        is_deleted: true,
      },
    });
    return responseGenerator(200, res, {
      message: deleted_data.course_id
        ? 'Successfully deleted'
        : 'Unable to delete',
      error: deleted_data.course_id ? false : true,
      success: !deleted_data.course_id ? false : true,
      course: deleted_data,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = delete_course_controller;
