const cancel_sslcommerz_controller = (req, res) => {
  return res.redirect(`${process.env.FRONTEND_URL}/payment/cancel`);
};

module.exports = cancel_sslcommerz_controller;
