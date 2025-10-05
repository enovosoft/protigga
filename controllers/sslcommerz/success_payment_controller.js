const success_payment_controller = (req, res) => {
  return res.redirect(`${process.env.FRONTEND_URL}/payment/success`);
};

module.exports = success_payment_controller;
