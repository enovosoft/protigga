const { validatePayment } = require('../utils/payment.utils');
const responseGenerator = require('../utils/responseGenerator');

const validate_ssl_payment = async (req, res, next) => {
  try {
    const { val_id } = req.body;

    const validationResponse = await validatePayment(val_id);
    if (!validationResponse) {
      return responseGenerator(500, res, {
        success: false,
        message: 'Payment validation failed.',
        error: true,
      });
    }
    req.ssl_validation_response = validationResponse;
    const { status } = validationResponse;

    if (status === 'VALID') {
      req.sslValidated = validationResponse;
      return next();
    } else if (status === 'INVALID_TRANSACTION') {
      req.sslValidated = validationResponse;
      return next();
    }
  } catch (error) {
    return next(error);
  }
};

module.exports = validate_ssl_payment;
