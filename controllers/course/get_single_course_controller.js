const prisma = require('../../config/db');
const responseGenerator = require('../../utils/responseGenerator');

const get_single_course_controller = async (req, res, next) => {
  try {
    const accessible = req.accessible || false;
    const { slug } = req.params || '';

    const course = await prisma.course.findFirst({
      where: {
        slug,
        is_deleted: false,
      },
      include: {
        exams: Boolean(accessible)
          ? {
              where: {
                exam_end_time: {
                  gte: new Date(),
                },
              },
            }
          : false,
        course_details: true,
        announcements: accessible
          ? {
              where: {
                end_date: {
                  gte: new Date(),
                },
              },
              select: {
                title: Boolean(accessible),
                description: Boolean(accessible),
                course: Boolean(accessible),
                start_date: Boolean(accessible),
                end_date: Boolean(accessible),
              },
            }
          : false,
        related_books: {
          select: {
            slug: true,
            stock: true,
            batch: true,
            book_image: true,
            title: true,
            price: true,
            writter: true,
            description: true,
          },
        },
        chapters: {
          select: {
            course_id: Boolean(accessible),
            chapter_id: Boolean(accessible),
            title: true,
            topics: {
              select: {
                chapter_id: Boolean(accessible),
                chapter_topic_id: Boolean(accessible),
                youtube_url: Boolean(accessible),
                title: true,
              },
            },
          },
        },
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
