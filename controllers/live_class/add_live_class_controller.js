const shortid = require('shortid');
const prisma = require('../../config/db');
const responseGenerator = require('../../utils/responseGenerator');
const find_course_by_slug = require('../course/utils/find_course_by_slug');

const add_live_class_controller = async (req, res, next) => {
  try {
    const {
      title,
      description,
      teacher_name,
      start_time,
      end_time,
      meeting_id,
      meeting_password,
      join_url,
      course_id,
    } = req.body || {};

    //  ======================= find_coourse
    const { exist } = await find_course_by_slug({
      course_id,
    });
    //=========== checking
    if (!exist) {
      return responseGenerator(404, res, {
        message: 'course not found. please select valid course',
        success: false,
        error: true,
      });
    }
    // ================== save live class data
    const saved_live_class_data = await prisma.live_class.create({
      data: {
        live_class_id: shortid.generate(),
        title,
        description,
        teacher_name,
        start_time,
        end_time,
        meeting_id,
        meeting_password,
        join_url,
        course_id,
      },
    });
    // ===================== not success
    if (!saved_live_class_data?.live_class_id) {
      return responseGenerator(404, res, {
        message: 'failed to save live class',
        success: false,
        error: true,
      });
    }
    // ===================== success
    if (saved_live_class_data?.live_class_id) {
      return responseGenerator(201, res, {
        message: 'successfully saved live class',
        success: true,
        error: false,
      });
    }
  } catch (error) {
    return next(error);
  }
};

module.exports = add_live_class_controller;
