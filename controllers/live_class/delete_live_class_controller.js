const prisma = require('../../config/db');
const responseGenerator = require('../../utils/responseGenerator');
const delete_live_class_controller = async (req, res, next) => {
  try {
    const live_class_id = req.params?.live_class_id?.trim();
    //  ======================= find_coourse
    const live_class_data = await prisma.live_class.findUnique({
      where: {
        live_class_id,
        is_deleted: false,
      },
    });

    //=========== checking
    if (!live_class_data?.live_class_id) {
      return responseGenerator(404, res, {
        message: 'course not found. please select valid course',
        success: false,
        error: true,
      });
    }

    const updated_data = await prisma.live_class.update({
      where: {
        live_class_id,
      },
      data: {
        is_deleted: true,
      },
    });

    // ===================== not success
    if (!updated_data?.live_class_id) {
      return responseGenerator(404, res, {
        message: 'failed to delete',
        success: false,
        error: true,
      });
    }
    // ===================== success
    if (updated_data?.live_class_id) {
      return responseGenerator(200, res, {
        message: 'successfully deleted',
        success: true,
        error: false,
      });
    }
  } catch (error) {
    return next(error);
  }
};

module.exports = delete_live_class_controller;
