const login_controller = require('../../controllers/auth/login_controller');
const logout_controller = require('../../controllers/auth/logout_controller');
const check_verified_user = require('../../middlewares/check_verified_user');
const is_blocked = require('../../middlewares/is_blocked');
const login_validation = require('../../validators/auth/login_validation');

const validate = require('../../validators/utils/validate');

const auth_route = require('express').Router();

auth_route.post(
  '/auth/login',
  validate(login_validation),
  check_verified_user,
  is_blocked,
  login_controller
);
auth_route.get('/auth/logout', logout_controller);
module.exports = auth_route;
