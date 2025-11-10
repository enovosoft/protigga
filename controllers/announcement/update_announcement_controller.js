const prisma = require('../../config/db');
const responseGenerator = require('../../utils/responseGenerator');
const send_message = require('../../utils/send_message');

const update_announcement_controller = async (req, res, next) => {
  try {
    const {
      announcement_id,
      title,
      description,
      course_id,
      attachment_url,
      status,
      start_date,
      end_date,
      is_send_sms,
    } = req.body || {};
    // ==================== check course data
    if (course_id) {
      const courseExists = await prisma.course.findUnique({
        where: { course_id },
      });
      if (!courseExists) {
        return responseGenerator(400, res, {
          message: 'Invalid course_id',
          error: true,
          success: false,
        });
      }
    }
    // =================== search announcement
    const searched_data = await prisma.announcement.findFirst({
      where: {
        announcement_id,
      },
      include: {
        course: true,
      },
    });

    // ================== check: if announcemnt not found
    if (!searched_data?.announcement_id)
      return responseGenerator(404, res, {
        message: 'accouncement not found',
        error: true,
        success: false,
      });

    // ================= save announcement
    const updated_announcemnt = await prisma.announcement.update({
      where: {
        announcement_id,
      },
      data: {
        title,
        description,
        attachment_url,
        course_id,
        status,
        start_date,
        end_date,
        is_send_sms,
      },
    });

    // ================= send SMS (if enabled)
    if (is_send_sms) {
      const enrollments = await prisma.enrollment.findMany({
        where: { course_id },
        include: {
          user: {
            select: { phone: true },
          },
        },
      });

      for (const enrollment of enrollments) {
        if (enrollment?.user?.phone) {
          await send_message(enrollment.user.phone, title);
        }
      }
    }

    // ================= not success response
    if (!updated_announcemnt?.announcement_id) {
      return responseGenerator(500, res, {
        message: 'failed',
        success: false,
        error: true,
      });
    }
    // =================  success response
    if (updated_announcemnt?.announcement_id) {
      return responseGenerator(201, res, {
        message: 'Announcement updated successfully',
        announcement: updated_announcemnt,
        success: true,
        error: false,
      });
    }
  } catch (error) {
    return next(error);
  }
};

module.exports = update_announcement_controller;
