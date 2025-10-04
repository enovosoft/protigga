const prisma = require('../../config/db');
const responseGenerator = require('../../utils/responseGenerator');
const find_promocode = require('./utils/find_promocode');

const delete_promocode_controller = async (req, res, next) => {
  try {
    const { promo_code_id } = req.body;
    const { exist } = await find_promocode({ promo_code_id });
    //     check : if not exist
    if (!exist)
      return responseGenerator(404, res, {
        message: 'data not found',
        success: false,
        error: true,
      });
    const deleted_promocode = await prisma.promo_code.delete({
      where: { promo_code_id },
    });
    //  ============ check : if not deleted
    if (!deleted_promocode?.id)
      return responseGenerator(500, res, {
        message: 'faild to delete',
        success: false,
        error: true,
      });
    //  ============ check : if  deleted
    if (deleted_promocode?.id)
      return responseGenerator(200, res, {
        message: 'successfullt deleted',
        success: true,
        error: false,
        promocode: deleted_promocode,
      });
  } catch (error) {
    return next(error);
  }
};

module.exports = delete_promocode_controller;
