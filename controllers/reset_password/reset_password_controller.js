const prisma = require('../../config/db');
const bcrypt = require('bcrypt');
const responseGenerator = require('../../utils/responseGenerator');
const otp_checker = require('../../utils/otp_checker');

const reset_password_controller = async (req, res, next) => {
  try {
    const { phone, password, otp } = req.body || {};
    //  ================= check otp
    await otp_checker({ otp, phone }, res);
    // ================== password update
    const updated_data = await prisma.user.update({
      where: { phone },
      data: {
        password: bcrypt.hashSync(password, 10),
      },
    });

    //   delete otp
    await prisma.otp.deleteMany({
      where: { phone },
    });

    // =================== response
    if (updated_data?.phone)
      return responseGenerator(200, res, {
        message: 'password reset successfully!',
        error: false,
        success: true,
      });

    if (!updated_data?.phone)
      return responseGenerator(200, res, {
        message: 'something went wrong, try again!',
        error: true,
        success: false,
      });
  } catch (error) {
    return next(error);
  }
};

module.exports = reset_password_controller;
