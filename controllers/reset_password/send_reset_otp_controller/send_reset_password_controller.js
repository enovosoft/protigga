const shortid = require('shortid');
const prisma = require('../../../config/db');
const bcrypt = require('bcrypt');
const responseGenerator = require('../../../utils/responseGenerator');
const sendOTP = require('../../../utils/sendOTP');
const generate6DigitOtp = require('../../../utils/six_digit_otp_generator');
const normalizePhoneNumber = require('../../../utils/normalize_phone_number');

const send_reset_password_controller = async (req, res, next) => {
  try {
    const { phone } = req.body || {};
    const otp = generate6DigitOtp();
    const sender_otp_details = await sendOTP(`your otp is ${otp} `);
    if (sender_otp_details.success) {
      // ====== save  to db
      await prisma.otp.create({
        data: {
          otp_id: shortid.generate(),
          otp: bcrypt.hashSync(String(otp), 10),
          otp_type: 'reset_password',
          phone: normalizePhoneNumber(phone),
          expiry_date: new Date(Date.now() + 5 * 60 * 1000), //--- for 5 min
        },
      });
      //  ============== response back
      return responseGenerator(200, res, {
        message: `OTP sendedn to ${phone}. please check your message otp: ${otp}`,
        success: true,
        error: false,
      });
    } else {
      return responseGenerator(200, res, {
        message: `failed to send OTP`,
        success: false,
        error: true,
      });
    }
  } catch (error) {
    return next(error);
  }
};

module.exports = send_reset_password_controller;
