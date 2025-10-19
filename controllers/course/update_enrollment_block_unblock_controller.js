const prisma = require('../../config/db');
const responseGenerator = require('../../utils/responseGenerator');

const update_enrollment_block_unblock_controller = async (req, res, next) => {
  try {
    const { enrollment_id, user_id } = req.body;
    const enrollment_data = await prisma.enrollment.findFirst({
      where: {
        enrollment_id,
        user_id,
      },
    });
    // ============== if enrollment data not found
    if (!enrollment_data?.enrollment_id) {
      return responseGenerator(400, res, {
        message: 'Invalid Enrollment data ',
        error: true,
        success: false,
      });
    }
    // =============== update block unblock data
    const updated_data = await prisma.enrollment.update({
      where: {
        enrollment_id,
        user_id,
      },
      data: {
        is_blocked: !enrollment_data.is_blocked,
      },
    });

    return responseGenerator(201, res, {
      message: 'updated successfully',
      success: true,
      error: false,
      updated_data,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = update_enrollment_block_unblock_controller;
