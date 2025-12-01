const { validatePayment } = require('../utils/payment.utils');

const validate_ssl_payment = async (req, res, next) => {
  try {
    const { val_id, risk_level } = req.body || {};

    const validationResponse = await validatePayment(val_id);

    if (
      !validationResponse ||
      validationResponse.status === 'INVALID_TRANSACTION'
    ) {
      return res.redirect(
        `${process.env.FRONTEND_URL}/payment/fail?message=Payment validation failed.`
      );
    }
    req.ssl_validation_response = validationResponse;
    const { status } = validationResponse;

    if (status === 'VALID' && Number(risk_level) !== 1) {
      req.sslValidated = validationResponse;
      return next();
    }
  } catch (error) {
    return next(error);
  }
};

module.exports = validate_ssl_payment;
