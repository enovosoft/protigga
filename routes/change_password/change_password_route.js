const change_password_controller = require('../../controllers/change_password/change_password_controller');
const check_verified_user = require('../../middlewares/check_verified_user');
const change_password_validation = require('../../validators/change_password/change_password_validaton');
const validate = require('../../validators/utils/validate');

const change_password_route = require('express').Router();

change_password_route.post(
  '/auth/change-password',
  validate(change_password_validation),
  check_verified_user,
  change_password_controller
);

module.exports = change_password_route;
