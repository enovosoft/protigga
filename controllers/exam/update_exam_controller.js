const prisma = require('../../config/db');
const responseGenerator = require('../../utils/responseGenerator');

const update_exam_controller = async (req, res, next) => {
  try {
    const {
      exam_id,
      exam_title,
      exam_description,
      exam_link,
      exam_start_time,
      exam_end_time,
    } = req.body || {};

    if (!exam_id) {
      return responseGenerator(400, res, {
        message: 'required data missing',
        success: false,
        error: true,
      });
    }

    // Check if exam exists
    const exam = await prisma.exam.findUnique({
      where: { exam_id },
    });

    if (!exam) {
      return responseGenerator(404, res, {
        message: 'Exam not found',
        success: false,
        error: true,
      });
    }

    // Update the exam
    const updated_exam = await prisma.exam.update({
      where: { exam_id },
      data: {
        exam_title,
        exam_description,
        exam_link,
        exam_start_time,
        exam_end_time,
      },
    });

    return responseGenerator(200, res, {
      message: 'Exam updated successfully',
      success: true,
      error: false,
      exam: updated_exam,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = update_exam_controller;
