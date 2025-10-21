const add_course_controller = require('../../controllers/course/add_course_controller');
const delete_course_controller = require('../../controllers/course/delete_course_controller');
const get_all_courses_controller = require('../../controllers/course/get_all_courses_controller');

const get_single_course_controller = require('../../controllers/course/get_single_course_controller');
const see_all_enrollments_controller = require('../../controllers/course/see_all_enrollments_controller');

const update_course_controller = require('../../controllers/course/update_course_controller');
const update_enrollment_block_unblock_controller = require('../../controllers/course/update_enrollment_block_unblock_controller');
const auth_middleware = require('../../middlewares/auth_middleware');
const check_is_admin_enrollment_existance_and_expiry_date = require('../../middlewares/check_is_admin_enrollment_existance_and_expiry_data');
const check_verified_user = require('../../middlewares/check_verified_user');
const cookie_decoder = require('../../middlewares/cookie_decoder');
const is_admin = require('../../middlewares/is_admin');
const is_blocked = require('../../middlewares/is_blocked');
const token_regenerator = require('../../middlewares/token_regenerator');
const add_course_validation = require('../../validators/course/add_course_validation');
const update_enrollment_block_unblock_validation = require('../../validators/course/enrollment/update_enrollment_block_unblock_validation');
const update_course_validation = require('../../validators/course/update_course_validation');
const validate = require('../../validators/utils/validate');

const course_route = require('express').Router();

course_route.get('/courses', get_all_courses_controller);
course_route.get('/course/:slug', get_single_course_controller);
course_route.get(
  '/control/course/:slug',
  token_regenerator,
  cookie_decoder,
  check_verified_user,
  auth_middleware,
  is_blocked,
  check_is_admin_enrollment_existance_and_expiry_date,
  get_single_course_controller
);
course_route.get(
  '/enrollments',
  token_regenerator,
  cookie_decoder,
  check_verified_user,
  auth_middleware,
  is_admin,
  see_all_enrollments_controller
);
course_route.put(
  '/enrollment',
  validate(update_enrollment_block_unblock_validation),
  token_regenerator,
  cookie_decoder,
  check_verified_user,
  auth_middleware,
  is_admin,
  update_enrollment_block_unblock_controller
);
course_route.post(
  '/course',
  validate(add_course_validation),
  token_regenerator,
  cookie_decoder,
  check_verified_user,
  auth_middleware,
  is_admin,
  add_course_controller
);
course_route.put(
  '/course/:slug',
  validate(update_course_validation),
  token_regenerator,
  cookie_decoder,
  check_verified_user,
  auth_middleware,
  is_admin,
  update_course_controller
);
course_route.delete(
  '/course/:slug',
  token_regenerator,
  cookie_decoder,
  check_verified_user,
  auth_middleware,
  is_admin,
  delete_course_controller
);

module.exports = course_route;
