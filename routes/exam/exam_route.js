const add_exam_controller = require('../../controllers/exam/add_exam_controller');
const delete_exam_controller = require('../../controllers/exam/delete_exam_controller');
const get_all_exam_controller = require('../../controllers/exam/get_all_exam_controller');
const update_exam_controller = require('../../controllers/exam/update_exam_controller');
const auth_middleware = require('../../middlewares/auth_middleware');
const check_verified_user = require('../../middlewares/check_verified_user');
const cookie_decoder = require('../../middlewares/cookie_decoder');
const is_admin = require('../../middlewares/is_admin');
const token_regenerator = require('../../middlewares/token_regenerator');
const add_exam_validation = require('../../validators/exam/add_exam_validation');
const delete_exam_validation = require('../../validators/exam/delete_exam_validation');
const update_exam_validation = require('../../validators/exam/update_exam_validation');
const validate = require('../../validators/utils/validate');

const exam_route = require('express').Router();
exam_route.get('/exams', get_all_exam_controller);
exam_route.post(
  '/exam',
  validate(add_exam_validation),
  token_regenerator,
  cookie_decoder,
  check_verified_user,
  auth_middleware,
  is_admin,
  add_exam_controller
);
exam_route.put(
  '/exam',
  validate(update_exam_validation),
  token_regenerator,
  cookie_decoder,
  check_verified_user,
  auth_middleware,
  is_admin,
  update_exam_controller
);
exam_route.delete(
  '/exam',
  validate(delete_exam_validation),
  token_regenerator,
  cookie_decoder,
  check_verified_user,
  auth_middleware,
  is_admin,
  delete_exam_controller
);

module.exports = exam_route;
