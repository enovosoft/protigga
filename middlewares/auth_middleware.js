const responseGenerator = require('../utils/responseGenerator');

const auth_middleware = async (req, res, next) => {
  try {
    const user = req.decoded_user;
    if (!user)
      return responseGenerator(401, res, {
        message: 'user not logged in, please login first',
        error: true,
        success: false,
      });
    return next();
  } catch (error) {
    return next(error);
  }
};

module.exports = auth_middleware;
