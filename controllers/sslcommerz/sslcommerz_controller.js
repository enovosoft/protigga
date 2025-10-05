const { initPayment, validatePayment } = require('../../utils/payment.utils');

require('dotenv').config();

const createPayment = async (req, res) => {
  try {
    const { amount, tran_id, customer } = req.body;
    const data = {
      total_amount: amount,
      currency: 'BDT',
      tran_id: tran_id, // unique transaction id
      success_url: `${process.env.BASE_URL}/api/v1/payment/success?tran_id=${tran_id}`,
      fail_url: `${process.env.BASE_URL}/api/v1/payment/fail?tran_id=${tran_id}`,
      cancel_url: `${process.env.BASE_URL}/api/v1/payment/cancel?tran_id=${tran_id}`,
      ipn_url: `${process.env.BASE_URL}/api/v1/payment/ipn`,
      shipping_method: 'NO',
      product_name: 'Course / Book Purchase',
      product_category: 'Education',
      product_profile: 'general',
      cus_name: customer.name,
      cus_email: customer.email,
      cus_add1: customer.address,
      cus_phone: customer.phone,
    };

    const apiResponse = await initPayment(data);

    res.json({
      status: 'SUCCESS',
      payment_url: apiResponse.GatewayPageURL,
    });
  } catch (error) {
    res.status(500).json({
      status: 'FAILED',
      message: error.message,
    });
  }
};

const ipnListener = async (req, res) => {
  try {
    const { val_id } = req.body;
    const validation = await validatePayment(val_id);
    console.log('IPN Validated:', validation);
    res.status(200).json({ message: 'IPN received', validation });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

module.exports = {
  createPayment,
  ipnListener,
};
