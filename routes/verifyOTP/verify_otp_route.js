const verify_otp_controller = require('../../controllers/verify_otp/verify_otp_controller');
const validate = require('../../validators/utils/validate');
const verify_otp_validation = require('../../validators/verifyOTP/verify_otp_validation');

const verify_otp_route = require('express').Router();

verify_otp_route.post(
  '/verify/otp',
  validate(verify_otp_validation),
  verify_otp_controller
);
module.exports = verify_otp_route;
