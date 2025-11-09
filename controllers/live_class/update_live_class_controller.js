const prisma = require('../../config/db');
const responseGenerator = require('../../utils/responseGenerator');

const update_live_class_controller = async (req, res, next) => {
  try {
    const {
      live_class_id,
      title,
      description,
      teacher_name,
      start_time,
      end_time,
      meeting_id,
      meeting_password,
      join_url,
    } = req.body || {};

    // find live class data
    const live_class_data = await prisma.live_class.findUnique({
      where: {
        live_class_id,
        is_deleted: false,
      },
    });

    //     checking
    if (!live_class_data?.live_class_id) {
      return responseGenerator(404, res, {
        message: 'sorry live class data not found',
        error: true,
        success: false,
      });
    }
    // ================== update live class data
    const saved_live_class_data = await prisma.live_class.update({
      where: { live_class_id },
      data: {
        title,
        description,
        teacher_name,
        start_time,
        end_time,
        meeting_id,
        meeting_password,
        join_url,
      },
    });
    // ===================== not success
    if (!saved_live_class_data?.live_class_id) {
      return responseGenerator(404, res, {
        message: 'failed to update live class',
        success: false,
        error: true,
      });
    }
    // ===================== success
    if (saved_live_class_data?.live_class_id) {
      return responseGenerator(202, res, {
        message: 'successfully updated live class',
        success: true,
        error: false,
      });
    }
  } catch (error) {
    return next(error);
  }
};

module.exports = update_live_class_controller;
