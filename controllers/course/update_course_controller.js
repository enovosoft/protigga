const prisma = require('../../config/db');
const responseGenerator = require('../../utils/responseGenerator');
const slug_generator = require('../../utils/slug_generator');
const find_course_by_slug = require('./utils/find_course_by_slug');

const update_course_controller = async (req, res, next) => {
  try {
    let {
      slug,
      batch,
      course_title,
      price,
      thumbnail,
      academy_name,
      description,
      related_books: related_books_,
      quiz_count,
      assessment,
      skill_level,
      expired_date,
      is_featured,
    } = req.body || {};
    // ================
    const { slug: slug_ } = req.params || {};
    if (!slug) {
      slug = slug_;
    }

    const { exist, searched_data } = await find_course_by_slug({ slug });
    // --------------- if not exist
    if (!exist)
      return responseGenerator(404, res, {
        message: 'course Not found',
        success: false,
        error: true,
      });

    //  ====================== check: if exist -> update
    // ============ new slug
    let new_slug = slug_generator(course_title);
    let { exist: slugExists } = await find_course_by_slug({ slug: new_slug });
    // loop until we get a unique slug
    while (slugExists && searched_data.course_title !== course_title) {
      new_slug = slug_generator(course_title, false); // generate a new slug
      const result = await find_course_by_slug({ slug: new_slug });
      slugExists = result.exist;
    }
    let validBooks = [];
    if (related_books_?.length) {
      const existingBooks = await prisma.book.findMany({
        where: { book_id: { in: related_books_ } },
        select: { book_id: true },
      });
      validBooks = existingBooks.map((b) => ({ book_id: b.book_id }));
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
        related_books: { set: validBooks },
        is_featured,
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
      include: {
        related_books: true,
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
