const registration_controller = require('../../controllers/registration/registrationController');
const registration_validation = require('../../validators/registration/registration_validation');
const validate = require('../../validators/utils/validate');

const registration_route = require('express').Router();
registration_route.post(
  '/auth/registration',
  validate(registration_validation),
  registration_controller
);

module.exports = registration_route;
