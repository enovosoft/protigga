// utils/cookie_setter.js
const cookie_setter = (res, token, cookieName = 'token', options = {}) => {
  const isProduction = process.env.NODE_ENV === 'production';
  const isLocalDev = !isProduction && process.env.LOCAL_CROSS_DOMAIN === 'true';

  res.cookie(cookieName, token, {
    httpOnly: true, // secure from JS
    secure: isProduction, // HTTPS required for prod
    sameSite: isProduction || isLocalDev ? 'none' : 'lax', // allow cross-domain
    maxAge: options.maxAge || 1000 * 60 * 60 * 24, // 1 day default
    ...options,
  });
};

module.exports = cookie_setter;
