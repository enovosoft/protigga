const shortid = require('shortid');
const prisma = require('../../config/db');
const responseGenerator = require('../../utils/responseGenerator');
const find_course_by_slug = require('../course/utils/find_course_by_slug');
const send_message = require('../../utils/send_message');

const add_announcement_controller = async (req, res, next) => {
  try {
    const {
      title,
      description,
      course_id,
      attachment_url,
      status,
      start_date,
      end_date,
      is_send_sms,
    } = req.body || {};

    // =================== check course data
    const { exist } = await find_course_by_slug({ course_id });
    if (!exist) {
      return responseGenerator(404, res, {
        message: 'Invalid course info',
        error: true,
        success: false,
      });
    }

    // ================= save announcement
    const saved_announcement = await prisma.announcement.create({
      data: {
        announcement_id: shortid.generate(),
        title,
        description,
        course_id,
        attachment_url,
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

      const phone_numbers = [];
      for (const enrollment of enrollments) {
        if (enrollment?.user?.phone) {
          phone_numbers.push(enrollment.user.phone?.split('+')[1]);
        }
      }
      await send_message(
        phone_numbers,
        `${title} ~ 
        ${description}`
      );
    }

    // ================= not success response
    if (!saved_announcement?.announcement_id) {
      return responseGenerator(201, res, {
        message: 'Failed',
        success: false,
        error: true,
      });
    }
    // =================  success response
    if (saved_announcement?.announcement_id) {
      return responseGenerator(201, res, {
        message: 'Announcement added successfully',
        announcement: saved_announcement,
        success: true,
        error: false,
      });
    }
  } catch (error) {
    return next(error);
  }
};

module.exports = add_announcement_controller;
