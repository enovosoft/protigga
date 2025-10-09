const shortid = require('shortid');
const prisma = require('../../config/db');
const responseGenerator = require('../../utils/responseGenerator');

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
