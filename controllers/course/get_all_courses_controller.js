const prisma = require('../../config/db');
const responseGenerator = require('../../utils/responseGenerator');

const get_all_courses_controller = async (req, res, next) => {
  try {
    let { featured } = req.query || '';
    if (String(featured).toLowerCase() == 'true') featured = true;
    else featured = false;

    const courses = await prisma.course.findMany({
      where: featured
        ? {
            is_deleted: false,
            is_featured: featured,
          }
        : {
            is_deleted: false,
          },
      select: {
        course_id: true,
        batch: true,
        course_title: true,
        slug: true,
        price: true,
        thumbnail: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
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
