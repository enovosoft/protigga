const shortid = require('shortid');
const prisma = require('../../config/db');
const responseGenerator = require('../../utils/responseGenerator');
const find_course_by_slug = require('../course/utils/find_course_by_slug');

const add_chapter_controller = async (req, res, next) => {
  try {
    const { course_id, title } = req.body || {};

    // ----------- find valid course
    const { exist } = await find_course_by_slug({ course_id });
    if (!exist)
      return responseGenerator(404, res, {
        message: 'invalid course details',
        error: true,
        success: false,
      });
    // ------------------ add
    const added_item = await prisma.chapter.create({
      data: {
        chapter_id: shortid.generate(),
        course_id,
        title,
      },
    });
    // ----------- check: and reponse
    if (!added_item?.chapter_id)
      return responseGenerator(500, res, {
        message: 'Unable to create chapter',
        error: true,
        success: false,
      });
    // ------- success
    if (added_item?.chapter_id)
      return responseGenerator(201, res, {
        message: 'chapter addedsuccessfully',
        error: false,
        success: true,
        chapter: added_item,
      });
  } catch (error) {
    return next(error);
  }
};

module.exports = add_chapter_controller;
