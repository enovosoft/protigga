const prisma = require('../../config/db');
const responseGenerator = require('../../utils/responseGenerator');

const get_all_announcements_controller = async (req, res, next) => {
  try {
    const announcements = await prisma.announcement.findMany();

    //     response
    return responseGenerator(201, res, {
      message: 'loaded annoucements',
      error: false,
      success: true,
      announcements,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = get_all_announcements_controller;
