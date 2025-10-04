// utils/get_cookie.js
const getCookieFromReq = (req, name) => {
  // if using cookie-parser
  return req.cookies && req.cookies[name];
};

module.exports = getCookieFromReq;
