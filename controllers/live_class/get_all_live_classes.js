const prisma = require('../../config/db');
const responseGenerator = require('../../utils/responseGenerator');

const get_all_live_classes = async (req, res, next) => {
  try {
    const live_classes = await prisma.live_class.findMany({
      where: {
        is_deleted: false,
      },
      include: {
        course: true,
      },
    });
    //     ================= response
    return responseGenerator(200, res, {
      message: 'live classes loaded',
      success: true,
      error: false,
      live_classes,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = get_all_live_classes;
