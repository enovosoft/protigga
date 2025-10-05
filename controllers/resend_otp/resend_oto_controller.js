const shortid = require('shortid');
const prisma = require('../../config/db');
const bcrypt = require('bcrypt');
const checkUserExists = require('../../utils/checkUserExists');
const responseGenerator = require('../../utils/responseGenerator');
const sendOTP = require('../../utils/sendOTP');
const generate6DigitOtp = require('../../utils/six_digit_otp_generator');
const normalizePhoneNumber = require('../../utils/normalize_phone_number');

const resend_otp_controller = async (req, res, next) => {
  try {
    const { phone, otp_type } = req.body || {};
    // ============== check in db
    const { exist } = await checkUserExists({ phone });
    if (!exist)
      return responseGenerator(404, res, {
        message: `User not found. we aren't able to resend otp`,
        error: true,
        success: false,
      });

    //     delete all prev otp
    await prisma.otp.deleteMany({ where: { phone } });
    // ============ geenrate otp
    const otp = generate6DigitOtp();
    // ============== send otp
    const sended_otp_data = await sendOTP(`your otp is ${otp}`);
    if (!sended_otp_data.success) {
      return responseGenerator(500, res, {
        message: 'Failed to send otp',
        error: true,
        success: false,
      });
    }
    if (sended_otp_data.success) {
      //============ save on db
      const created_otp = await prisma.otp.create({
        data: {
          otp_id: shortid.generate(),
          otp_type: otp_type || 'registration',
          otp: bcrypt.hashSync(String(otp), 10),
          phone: normalizePhoneNumber(phone),
          expiry_date: new Date(Date.now() + 5 * 60 * 1000), //--- for 5 min
        },
      });
      //  ====== response back
      if (created_otp?.otp_id)
        return responseGenerator(500, res, {
          message: 'OTP sended successfully',
          error: false,
          success: true,
          otp,
        });
    }
  } catch (error) {
    return next(error);
  }
};

module.exports = resend_otp_controller;
