const { validatePayment } = require('../utils/payment.utils');

const validate_ssl_payment = async (req, res, next) => {
  try {
    const { val_id } = req.body;

    const validationResponse = await validatePayment(val_id);
    if (!validationResponse) {
      return res.status(500).json({
        success: false,
        message: 'Payment validation failed.',
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
