const { validatePayment } = require('../utils/payment.utils');

const validate_ssl_payment = async (req, res, next) => {
  try {
    const { val_id } = req.body;

    if (!val_id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot validate payment.',
      });
    }
    const validationResponse = await validatePayment(val_id);

    if (!validationResponse) {
      req.ssl_validation_response = validationResponse;
      return res.status(500).json({
        success: false,
        message: 'Payment validation failed.',
      });
    }

    const { risk_title, status } = validationResponse;

    if (status === 'VALID' && risk_title === 'Safe') {
      req.sslValidated = validationResponse;
      return next();
    }
    return res.status(400).json({
      success: false,
      message: `Invalid request`,
    });
  } catch (error) {
    return next();
  }
};

module.exports = validate_ssl_payment;
