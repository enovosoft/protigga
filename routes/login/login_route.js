const login_controller = require('../../controllers/login/login_controller');
const check_verified_user = require('../../middlewares/check_verified_user');
const is_blocked = require('../../middlewares/is_blocked');
const login_validation = require('../../validators/login/login_validation');
const validate = require('../../validators/utils/validate');

const login_route = require('express').Router();

login_route.post(
  '/auth/login',
  validate(login_validation),
  check_verified_user,
  is_blocked,
  login_controller
);
module.exports = login_route;
