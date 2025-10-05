const sslcz = require('../config/sslcommerz');

const initPayment = async (paymentData) => {
  try {
    const apiResponse = await sslcz.init(paymentData);
    return apiResponse;
  } catch (error) {
    throw new Error(error.message);
  }
};

const validatePayment = async (val_id) => {
  try {
    const response = await sslcz.validate({ val_id });
    return response;
  } catch (error) {
    throw new Error(error.message);
  }
};

module.exports = {
  initPayment,
  validatePayment,
};
