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
      related_books,
      expired_date,
      quiz_count,
      assessment,
      skill_level,
      is_featured,
      instractors,
    } = req.body || {};
    // =============== generate slug
    let slug = slug_generator(course_title);
    //================== search by slug
    const { exist, searched_data } = await find_course_by_slug({ slug });
    if (searched_data?.id) slug = slug_generator(course_title, false);

    // ----------------- valid book check
    let validBooks = [];
    if (related_books?.length) {
      const existingBooks = await prisma.book.findMany({
        where: { book_id: { in: related_books } },
        select: { book_id: true },
      });
      validBooks = existingBooks.map((b) => ({ book_id: b.book_id }));
    }
    // --------------- - valid instractor
    let validInstructors = [];
    if (instractors?.length) {
      const existingInstructors = await prisma.instractor.findMany({
        where: { instractor_id: { in: instractors } },
        select: { instractor_id: true },
      });

      validInstructors = existingInstructors.map((i) => ({
        instractor_id: i.instractor_id,
      }));
    }
    // ===================== create course.
    const created_course = await prisma.course.create({
      data: {
        course_id: shortid.generate(),
        batch,
        course_title,
        slug,
        price,
        thumbnail,
        is_featured,
        related_books: validBooks.length ? { connect: validBooks } : undefined,
        instractors: validInstructors.length
          ? { connect: validInstructors }
          : undefined,
        course_details: {
          create: {
            slug,
            course_details_id: shortid.generate(),
            academy_name,
            published_date: new Date(),
            language: 'Bangla',
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
        instractors: true,
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
