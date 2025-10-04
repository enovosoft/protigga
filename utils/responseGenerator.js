const responseGenerator = (
  status = 200,
  res,
  data = {
    message: 'reponse data fully empty',
    success: false,
    error: false,
    errors: [],
  }
) => {
  return res.status(status).json({
    status,
    ...data,
  });
};

module.exports = responseGenerator;
