const add_exam_controller = require('../../controllers/exam/add_exam_controller');
const update_exam_controller = require('../../controllers/exam/update_exam_controller');
const add_exam_validation = require('../../validators/exam/add_exam_validation');
const update_exam_validation = require('../../validators/exam/update_exam_validation');
const validate = require('../../validators/utils/validate');

const exam_route = require('express').Router();

exam_route.post('/exam', validate(add_exam_validation), add_exam_controller);
exam_route.put(
  '/exam',
  validate(update_exam_validation),
  update_exam_controller
);

module.exports = exam_route;
