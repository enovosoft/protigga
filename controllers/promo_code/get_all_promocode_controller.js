const prisma = require('../../config/db');
const responseGenerator = require('../../utils/responseGenerator');

const get_all_promocode_controller = async (req, res, next) => {
  try {
    const promocodes = await prisma.promo_code.findMany({
      where: {
        is_deleted: false,
      },
      include: {
        book: {
          where: {
            is_deleted: false,
          },
        },
        course: {
          where: {
            is_deleted: false,
          },
        },
      },
    });

    return responseGenerator(200, res, {
      message:
        promocodes.length > 0 ? 'promocode found' : 'Not course available',
      success: true,
      error: false,
      promocodes,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = get_all_promocode_controller;
