const resend_otp_controller = require('../../controllers/resend_otp/resend_oto_controller');

const resend_otp_route = require('express').Router();
resend_otp_route.post('/auth/resend-otp', resend_otp_controller);
module.exports = resend_otp_route;
