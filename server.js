require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const path = require('path');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const morgan = require('morgan');
// ================== router =================
const registration_route = require('./routes/registration/registration_route');
const verify_otp_route = require('./routes/verifyOTP/verify_otp_route');
const login_route = require('./routes/login/login_route');
const change_password_route = require('./routes/change_password/change_password_route');
const reset_password_route = require('./routes/reset_password/reset_password_route');
const file_meterial_router = require('./routes/file_meterial/file_meterial_route');
const note_route = require('./routes/note/note_route');
const promo_code_route = require('./routes/promo_code/promo_code_route');
const resend_otp_route = require('./routes/resend_otp/resend_otp_route');

const sslcommerz_route = require('./routes/sslcommerz/sslcommerz_route');
const book_route = require('./routes/book/book_route');
// ================== main =================
const app = express();
const port = process.env.SERVER_PORT || 5000;
// ================== middleware =================
app.use(
  express
    .json
    // { limit: '10kb' }
    ()
);
app.use(cookieParser());
//===================== allow list ======================
const allowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.FRONTEND_URL_PROD,
  process.env.SSLCOMMERZ_URL,
];

// 1️⃣ Handle all non-OPTIONS requests with CORS
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true); // curl/postman
      if (allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  })
);

if (process.env.NODE_ENV === 'production') {
  app.use(morgan('combined')); // production-friendly format
} else {
  app.use(morgan('dev')); // colorful, short format for dev
}

// Set security HTTP headers
app.use(helmet());
// Rate limiting
const limiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 100,
  keyGenerator: (req) => req?.body?.user_email || req?.body?.email || req?.ip,
  handler: (req, res, next) => {
    const error = new Error('Too many requests. Please try again later.');
    error.status = 429;
    return next(error);
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);
app.use('/file', express.static(path.join(__dirname, 'uploads')));
//==================== all router ==============================
app.use('/api/v1', registration_route);
app.use('/api/v1', verify_otp_route);
app.use('/api/v1', login_route);
app.use('/api/v1', change_password_route);
app.use('/api/v1', reset_password_route);
app.use('/api/v1', file_meterial_router);
app.use('/api/v1', note_route);
app.use('/api/v1', promo_code_route);
app.use('/api/v1', resend_otp_route);
app.use('/api/v1', sslcommerz_route);
app.use('/api/v1', book_route);

app.get('/', async (_req, res) => {
  res.json({ hi: 'sd' });
});

// =======================================================
app.get('/api/v1', async (req, res) => {
  res.json({ hi: 'sd' });
});
app.get('/api/health', async (req, res) => {
  res.json({ message: 'hello' });
});

// ================== global error handle =====================
app.use((err, _req, res, _next) => {
  const status = err.status || 500;
  // message decision
  let message = err.message || 'Something went wrong.';
  // ===check : if in production
  if (process.env.NODE_ENV === 'production') {
    if (message?.includes('prisma')) {
      message = 'You declined the database rules';
    }
  }
  return res.status(status).json({
    status,
    message,
    errors: err.errors || null,
    success: false,
    error: true,
  });
});
// =================== app listener ==============
app.listen(port, async () => {
  console.log(`Example app listening on port ${port}`);
});
