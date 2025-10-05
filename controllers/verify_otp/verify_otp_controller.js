const prisma = require('../../config/db');
const otp_checker = require('../../utils/otp_checker');
const responseGenerator = require('../../utils/responseGenerator');

const verify_otp_controller = async (req, res, next) => {
  try {
    const { otp, phone } = req.body || {};
    // otp checker
    const find_otp = await otp_checker({ otp, phone }, res);
    // check: if not exist
    if (!find_otp.otp_id)
      return responseGenerator(404, res, {
        message: 'Please follow your website rules',
        error: true,
        success: false,
      });
    // ================ update: field : is_verifed
    await prisma.user.update({
      where: {
        phone,
      },
      data: {
        is_verified: true,
      },
    });
    // ================ delete: otp
    await prisma.otp.deleteMany({ where: { id: find_otp.id } });
    return responseGenerator(200, res, {
      success: true,
      message: 'verified successfully',
      error: false,
    });
  } catch (err) {
    return next(err);
  }
};

module.exports = verify_otp_controller;
