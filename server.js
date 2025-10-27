require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const path = require('path');
const rateLimit = require('express-rate-limit');
const moment = require('moment-timezone');
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
const course_route = require('./routes/course/course_route');
const exam_route = require('./routes/exam/exam_route');
const manual_book_order_route = require('./routes/manual_action/manual_book_order_route');
const manual_course_enrollment_route = require('./routes/manual_action/manual_course_enrollment_route');
const chapter_route = require('./routes/chapter/chapter_route');
const user_route = require('./routes/user/user_route');
const topic_route = require('./routes/topic/topic_route');
const finance_route = require('./routes/finance/finance_route');
const announcement_route = require('./routes/announcement/announcement_route');
// ================== main =================
const app = express();
const port = process.env.SERVER_PORT || 5000;
// ================== middleware =================
app.use(express.json());
app.use(
  '/file',
  express.static(path.join(__dirname, 'uploads'), {
    setHeaders: (res, filePath) => {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    },
  })
);

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
// Middleware to attach Bangladesh time to each request
app.use((req, res, next) => {
  req.bangladeshTime = moment().tz('Asia/Dhaka').format('YYYY-MM-DD HH:mm:ss');
  next();
});

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
      callback(new Error('IP BLOCKED'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  })
);

// app.use(
//   cors({
//     origin: 'http://localhost:5173',
//     credentials: true,
//   })
// );
if (process.env.NODE_ENV === 'production') {
  app.use(morgan('combined')); // production-friendly format
} else {
  app.use(morgan('dev')); // colorful, short format for dev
}

// Set security HTTP headers
app.use(helmet());
// Rate limiting
const limiter = rateLimit({
  windowMs: 3 * 60 * 1000, // 3 minutes
  max: 3000,
  keyGenerator: (req) => req?.body?.user_email || req?.body?.email || req?.ip,
  handler: (req, res, next) => {
    const error = new Error('Too many requests. Please try again later.');
    error.status = 429;
    throw error;
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
app.use('/api/v1', course_route);
app.use('/api/v1', exam_route);
app.use('/api/v1', manual_book_order_route);
app.use('/api/v1', manual_course_enrollment_route);
app.use('/api/v1', chapter_route);
app.use('/api/v1', user_route);
app.use('/api/v1', topic_route);
app.use('/api/v1', finance_route);
app.use('/api/v1', announcement_route);

app.get('/', async (_req, res) => {
  return res.redirect(`${process.env.FRONTEND_URL}`);
});

// =======================================================
app.get('/api/v1', async (req, res) => {
  return res.redirect(`${process.env.FRONTEND_URL}`);
});
app.get('/api/health', async (req, res) => {
  return res.redirect(`${process.env.FRONTEND_URL}`);
});

// ================== global error handle =====================
app.use((err, _req, res, _next) => {
  console.log('global error', err);
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
  console.log(`protigga server running/listening on port ${port}`);
});
