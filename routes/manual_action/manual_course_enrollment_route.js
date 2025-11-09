const manual_enrollment_controller = require('../../controllers/manual_action/manual_enrollment_controller');
const is_admin = require('../../middlewares/is_admin');
const manual_enrollment_validation = require('../../validators/manual_action/manual_enrollment_validation');
const validate = require('../../validators/utils/validate');

const manual_course_enrollment_route = require('express').Router();
manual_course_enrollment_route.post(
  '/manual/enrollment',
  validate(manual_enrollment_validation),
  is_admin,
  manual_enrollment_controller
);

module.exports = manual_course_enrollment_route;
