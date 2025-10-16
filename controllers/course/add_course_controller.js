const shortid = require('shortid');
const prisma = require('../../config/db');
const slug_generator = require('../../utils/slug_generator');
const find_course_by_slug = require('./utils/find_course_by_slug');
const responseGenerator = require('../../utils/responseGenerator');

const add_course_controller = async (req, res, next) => {
  try {
    const {
      batch,
      course_title,
      price,
      thumbnail,
      academy_name,
      description,
      related_book,
      expired_date,
      quiz_count,
      assessment,
      skill_level,
    } = req.body || {};
    // =============== generate slug
    let slug = slug_generator(course_title);
    //================== search by slug
    const { exist, searched_data } = await find_course_by_slug({ slug });
    if (searched_data?.id) slug = slug_generator(course_title, false);

    // ===================== create course.
    const created_course = await prisma.course.create({
      data: {
        course_id: shortid.generate(),
        batch,
        course_title,
        slug,
        price,
        thumbnail,
        course_details: {
          create: {
            slug,
            course_details_id: shortid.generate(),
            academy_name,
            published_date: new Date(),
            language: 'Bangla',
            description,
            // related_book,
            quiz_count,
            assessment,
            skill_level,
            expired_date,
          },
        },
      },
    });
    //     ============ if : not created
    if (!created_course?.course_id)
      return responseGenerator(500, res, {
        message: 'something went wrong',
        success: false,
        error: true,
      });
    //     ============ if : created
    if (created_course?.course_id)
      return responseGenerator(201, res, {
        message: 'Saved successfully',
        success: true,
        error: false,
        course: created_course,
      });
  } catch (error) {
    return next(error);
  }
};

module.exports = add_course_controller;
