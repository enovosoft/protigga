const failed_sslcommerz_controller = (req, res) => {
  return res.redirect(`${process.env.FRONTEND_URL}/payment/fail`);
};

module.exports = failed_sslcommerz_controller;
