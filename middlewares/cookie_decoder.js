const jwt = require('jsonwebtoken');
const getCookieFromReq = require('../utils/getCookieFromReq');
const responseGenerator = require('../utils/responseGenerator');

const cookie_decoder = async (req, res, next) => {
  try {
    const access_token = getCookieFromReq(req, 'access_token');
    const refresh_token = getCookieFromReq(req, 'refresh_token');

    if (!access_token && !refresh_token) {
      return responseGenerator(401, res, {
        success: false,
        message: 'No tokens found in cookies',
      });
    }

    let decodedAccess = null;
    let decodedRefresh = null;

    // 🔑 Access token decode
    if (access_token) {
      try {
        decodedAccess = jwt.verify(
          access_token,
          process.env.ACCESS_TOKEN_SECRET
        );
      } catch (err) {
        if (err.name === 'TokenExpiredError') {
          return responseGenerator(401, res, {
            success: false,
            message: 'Access token expired',
          });
        }
        return responseGenerator(401, res, {
          success: false,
          message: 'Invalid access token',
        });
      }
    }

    //================== Refresh token decode
    if (refresh_token) {
      try {
        decodedRefresh = jwt.verify(
          refresh_token,
          process.env.REFRESH_TOKEN_SECRET
        );
      } catch (err) {
        if (err.name === 'TokenExpiredError') {
          return responseGenerator(401, res, {
            success: false,
            message: 'Refresh token expired',
          });
        }
        return responseGenerator(401, res, {
          success: false,
          message: 'Invalid refresh token',
        });
      }
    }
    req.decoded_user = decodedAccess || decodedRefresh;

    return next();
  } catch (error) {
    return next(error);
  }
};

module.exports = cookie_decoder;
