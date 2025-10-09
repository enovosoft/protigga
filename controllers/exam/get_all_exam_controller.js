const prisma = require('../../config/db');
const responseGenerator = require('../../utils/responseGenerator');

const get_all_exam_controller = async (req, res, next) => {
  try {
    const exams = await prisma.exam.findMany();
    return responseGenerator(200, res, {
      message: 'All exam found',
      error: false,
      success: true,
      exams,
    });
  } catch (error) {
    return next(error);
  }
};
module.exports = get_all_exam_controller;
