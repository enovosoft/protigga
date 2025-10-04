const reset_password_controller = require('../../controllers/reset_password/reset_password_controller');
const send_reset_password_controller = require('../../controllers/reset_password/send_reset_otp_controller/send_reset_password_controller');
const check_verified_user = require('../../middlewares/check_verified_user');
const reset_password_validation = require('../../validators/reset_password/reset_password_validation');
const send_reset_otp_validation = require('../../validators/reset_password/send_reset_otp/send_reset_otp_validation');
const validate = require('../../validators/utils/validate');

const reset_password_route = require('express').Router();

reset_password_route.post(
  '/auth/reset-password/send-otp',
  validate(send_reset_otp_validation),
  check_verified_user,
  send_reset_password_controller
);
reset_password_route.post(
  '/auth/reset-password',
  validate(reset_password_validation),
  check_verified_user,
  reset_password_controller
);
module.exports = reset_password_route;
