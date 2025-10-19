const prisma = require('../../config/db');
const responseGenerator = require('../../utils/responseGenerator');
const slug_generator = require('../../utils/slug_generator');
const find_course_by_slug = require('./utils/find_course_by_slug');

const update_course_controller = async (req, res, next) => {
  try {
    const {
      slug,
      batch,
      course_title,
      price,
      thumbnail,
      academy_name,
      description,
      related_book,
      quiz_count,
      assessment,
      skill_level,
      expired_date,
    } = req.body || {};

    const { exist, searched_data } = await find_course_by_slug({ slug });
    // --------------- if not exist
    if (!exist)
      return responseGenerator(404, res, {
        message: 'course Not found',
        success: false,
        error: true,
      });
    //  ====================== check: if exist -> update
    let new_slug = slug_generator(course_title);
    if (searched_data?.course_title !== course_title) {
      const { exist: exis_new } = await find_course_by_slug({ slug: new_slug });
      if (exis_new) new_slug = slug_generator(course_title, false);
    }

    // ------------- update part
    const updated_course = await prisma.course.update({
      where: {
        slug,
      },
      data: {
        batch,
        course_title,
        slug: new_slug,
        price,
        thumbnail,
        course_details: {
          update: {
            slug: new_slug,
            academy_name,
            description,
            quiz_count,
            assessment,
            skill_level,
            expired_date,
          },
        },
      },
    });
    //     ============ if : not updated
    if (!updated_course?.course_id)
      return responseGenerator(500, res, {
        message: 'something went wrong',
        success: false,
        error: true,
      });
    //     ============ if : updated
    if (updated_course?.course_id)
      return responseGenerator(200, res, {
        message: 'updated successfully',
        success: true,
        error: false,
        course: updated_course,
      });
  } catch (error) {
    return next(error);
  }
};
module.exports = update_course_controller;
