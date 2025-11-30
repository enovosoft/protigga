const prisma = require('../../config/db');
const responseGenerator = require('../../utils/responseGenerator');

const get_all_instractor_controller = async (req, res, next) => {
  try {
    const all_instructors = await prisma.instractor.findMany({
      select: {
        instractor_id: true,
        name: true,
        designation: true,
        teaching_experience: true,
        student_count: true,
        academy: true,
        image: true,
      },
    });
    return responseGenerator(200, res, {
      message: 'all instructor found',
      error: false,
      success: true,
      instructors: all_instructors,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = get_all_instractor_controller;
