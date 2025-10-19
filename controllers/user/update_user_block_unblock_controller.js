const prisma = require('../../config/db');
const checkUserExists = require('../../utils/checkUserExists');
const responseGenerator = require('../../utils/responseGenerator');

const update_user_block_unblock_controller = async (req, res, next) => {
  try {
    const { user_id } = req.body;
    const { exist, user } = await checkUserExists({ user_id });
    // ============== if user not found
    if (!exist) {
      return responseGenerator(400, res, {
        message: 'User not found ',
        error: true,
        success: false,
      });
    }
    // =============== update block unblock data
    const updated_data = await prisma.user.update({
      where: {
        user_id: user.user_id,
      },
      data: {
        is_blocked: !user?.is_blocked,
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

module.exports = update_user_block_unblock_controller;
