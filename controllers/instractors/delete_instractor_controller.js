const prisma = require('../../config/db');
const responseGenerator = require('../../utils/responseGenerator');

const delete_instractor_controller = async (req, res, next) => {
  try {
    const instractor_id = req.query?.instractor_id?.trim() || '';
    // ============ find instractor
    const find_instractor = await prisma.instractor.findUnique({
      where: {
        instractor_id,
      },
    });

    //     check
    if (!find_instractor?.instractor_id) {
      return responseGenerator(404, res, {
        message: 'Sorry, instractor not found',
        error: true,
        success: false,
      });
    }

    // if exist
    const deleted_instractor = await prisma.instractor.delete({
      where: {
        instractor_id,
      },
    });

    return responseGenerator(200, res, {
      message: 'successfully deleted',
      error: false,
      success: true,
      deleted_instractor,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = delete_instractor_controller;
