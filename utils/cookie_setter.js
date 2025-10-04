// utils/cookie_setter.js
const cookie_setter = (res, token, cookieName = 'token', options = {}) => {
  const isProduction = process.env.NODE_ENV === 'production';
  res.cookie(cookieName, token, {
    httpOnly: true, // JS cannot access
    secure: isProduction, // HTTPS in production
    sameSite: isProduction ? 'none' : 'lax', // cross-domain cookie in prod
    maxAge: options.maxAge || 1000 * 60 * 60 * 24, // default 1 day
    ...options, // allow overrides
  });
};

module.exports = cookie_setter;
