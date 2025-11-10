const prisma = require('../../config/db');
const responseGenerator = require('../../utils/responseGenerator');

const delete_enrollment_controller = async (req, res, next) => {
  try {
    const { announcement_id } = req.params || {};
    // ============= find announcement
    const finded_announcement = await prisma.announcement.findFirst({
      where: {
        announcement_id,
      },
    });
    // =================== if announcement not exist
    if (!finded_announcement?.announcement_id)
      return responseGenerator(404, res, {
        message: 'announcement not found',
        success: false,
        error: true,
      });
    // ================== delete
    const deleted_announcemnt = await prisma.announcement.delete({
      where: { announcement_id },
    });

    // =================== if announcement not exist
    if (!deleted_announcemnt?.announcement_id)
      return responseGenerator(404, res, {
        message: 'Failed to delete',
        success: false,
        error: true,
      });
    if (deleted_announcemnt?.announcement_id)
      return responseGenerator(200, res, {
        message: 'successfully deleted',
        success: true,
        announcement: deleted_announcemnt,
        error: false,
      });
  } catch (error) {
    return next(error);
  }
};

module.exports = delete_enrollment_controller;
