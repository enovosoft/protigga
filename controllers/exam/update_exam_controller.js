const prisma = require('../../config/db');

const update_exam_controller = async (req, res, next) => {
  try {
    const {
      exam_id,
      course_id,
      exam_title,
      exam_start_time,
      exam_end_time,
      exam_topic,
      exam_description,
      exam_link,
    } = req.body || {};

    const updated_exam = await prisma.exam.update({
      where: {
        exam_id,
      },
      data: {
        exam_title,
        exam_start_time,
        exam_end_time,
        exam_topic,
        exam_description,
        exam_link,
      },
    });
    if (!updated_exam?.exam_id)
      return responseGenerator(500, res, {
        message: 'something went wrong',
        success: false,
        error: true,
      });
    //     ============ if : created
    if (updated_exam?.exam_id)
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

module.exports = update_exam_controller;
