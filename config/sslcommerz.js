const SSLCommerz = require('sslcommerz-lts');
require('dotenv').config();

const store_id = process.env.STORE_ID;
const store_passwd = process.env.STORE_PASSWORD;
const is_live = process.env.IS_LIVE === 'true';

const sslcz = new SSLCommerz(store_id, store_passwd, is_live);

module.exports = sslcz;
