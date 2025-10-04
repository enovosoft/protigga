const prisma = require('../config/db');
const normalizePhoneNumber = require('./normalize_phone_number');
const bcrypt = require('bcrypt');
const otp_checker = async (data, res) => {
  const { otp, phone } = data;
  // =========== find: otp
  const find_otp = await prisma.otp.findFirst({
    where: {
      phone: normalizePhoneNumber(phone),
      expiry_date: { gte: new Date() }, // expired OTP skip করবে
    },
    orderBy: { createdAt: 'desc' },
  });
  //========== message: not found
  if (!find_otp) {
    const error = new Error('OTP expired or not found');
    error.statusCode = 404; // custom HTTP status
    throw error;
  }
  //=============== checking: valid otp
  const isValid = await bcrypt.compare(otp.toString(), find_otp.otp);

  if (!isValid) {
    const error = new Error('Invalid OTP');
    error.statusCode = 404; // custom HTTP status
    throw error;
  }
};

module.exports = otp_checker;
