const prisma = require('../../config/db');
const responseGenerator = require('../../utils/responseGenerator');

const delete_exam_controller = async (req, res, next) => {
  try {
    const { exam_id } = req.body || {};

    if (!exam_id) {
      return responseGenerator(400, res, {
        message: 'exam_id is required',
        success: false,
        error: true,
      });
    }

    // Check if exam exists first
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

    // Delete the exam
    const deleted_exam = await prisma.exam.delete({
      where: { exam_id },
    });

    return responseGenerator(200, res, {
      message: 'Exam deleted successfully',
      success: true,
      error: false,
      exam: deleted_exam,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = delete_exam_controller;
