const shortid = require('shortid');
const prisma = require('../../config/db');
const responseGenerator = require('../../utils/responseGenerator');

const update_instractor_controller = async (req, res, next) => {
  try {
    const {
      instractor_id,
      name,
      designation,
      teaching_experience,
      student_count,
      academy,
      image,
    } = req.body || {};
    const updated_instractor = await prisma.instractor.update({
      where: {
        instractor_id,
      },
      data: {
        name,
        designation,
        teaching_experience,
        student_count,
        academy,
        image,
      },
    });

    if (updated_instractor?.instractor_id) {
      return responseGenerator(201, res, {
        message: 'Instractor added successfully',
        success: true,
        error: false,
        errors: [],
        instractor: updated_instractor,
      });
    } else {
      return responseGenerator(400, res, {
        message: 'Instractor not added',
        success: false,
        error: true,
        errors: [],
      });
    }
  } catch (error) {
    return next(error);
  }
};

module.exports = update_instractor_controller;
