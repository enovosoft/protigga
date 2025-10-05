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

// ================== main =================
const app = express();
const port = process.env.SERVER_PORT || 5000;

// ================== middleware =================
app.use(express.json()); // single json parser
app.use(cookieParser());
app.use(helmet());

// ================== Logging =================
if (process.env.NODE_ENV === 'production') {
  app.use(morgan('combined'));
} else {
  app.use(morgan('dev'));
}

// ================== Rate Limiter =================
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

// ================== CORS =================
const allowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.FRONTEND_URL_PROD,
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true); // mobile apps, curl, postman
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  })
);

// ================== Static Files =================
app.use('/file', express.static(path.join(__dirname, 'uploads')));

// ================== Routes =================
app.use('/api/v1', registration_route);
app.use('/api/v1', verify_otp_route);
app.use('/api/v1', login_route);
app.use('/api/v1', change_password_route);
app.use('/api/v1', reset_password_route);
app.use('/api/v1', file_meterial_router);
app.use('/api/v1', note_route);
app.use('/api/v1', promo_code_route);

// ================== Test Routes =================
app.get('/', (req, res) => res.json({ message: 'Server is running 🚀' }));
app.get('/api/v1', (req, res) => res.json({ message: 'API v1 running ✅' }));
app.get('/api/health', (req, res) => res.json({ message: 'Health OK ✅' }));

// ================== Global Error Handler =================
app.use((err, _req, res, _next) => {
  const status = err.status || 500;
  let message = err.message || 'Something went wrong.';
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

// ================== App Listener =================
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
