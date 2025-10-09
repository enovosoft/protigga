const shortid = require('shortid');
const prisma = require('../../config/db');
const responseGenerator = require('../../utils/responseGenerator');
const find_course_by_slug = require('../course/utils/find_course_by_slug');

const add_exam_controller = async (req, res, next) => {
  try {
    const {
      course_id,
      exam_title,
      exam_start_time,
      exam_end_time,
      exam_topic,
      exam_description,
      exam_link,
    } = req.body || {};

    const { exist } = await find_course_by_slug({ course_id });
    // check : if not exist
    if (!exist)
      return responseGenerator(404, res, {
        message: 'Invalid course data',
        success: false,
        error: true,
      });

    // =========== save data
    const created_exam = await prisma.exam.create({
      data: {
        exam_id: shortid.generate(),
        course_id,
        exam_title,
        exam_start_time,
        exam_end_time,
        exam_topic,
        exam_description,
        exam_link,
      },
    });
    if (!created_exam?.exam_id)
      return responseGenerator(500, res, {
        message: 'something went wrong',
        success: false,
        error: true,
      });
    //     ============ if : created
    if (created_exam?.exam_id)
      return responseGenerator(201, res, {
        message: 'Saved successfully',
        success: true,
        error: false,
        exam: created_exam,
      });
  } catch (error) {
    return next(error);
  }
};

module.exports = add_exam_controller;
