const shortid = require('shortid');
const prisma = require('../../config/db');
const bcrypt = require('bcrypt');

const checkUserExists = require('../../utils/checkUserExists');
const normalizePhoneNumber = require('../../utils/normalize_phone_number');

const responseGenerator = require('../../utils/responseGenerator');

const generate6DigitOtp = require('../../utils/six_digit_otp_generator');
const send_message = require('../../utils/send_message');

const registration_controller = async (req, res, next) => {
  try {
    const { name, phone, password } = req.validatedData; // Zod validated data
    const normalizedPhone = normalizePhoneNumber(phone);

    // ============= Check if user exists=============
    const { exist, user } = await checkUserExists({ phone: normalizedPhone });
    if (exist) {
      const safeUser = { ...user };
      // ==================== delete sansetive property ===========
      delete safeUser.id;
      delete safeUser.password;
      delete safeUser.createdAt;
      delete safeUser.updatedAt;
      //============== reponse  :( ================
      return responseGenerator(409, res, {
        success: false,
        message: 'User already exists',
        user: safeUser,
      });
    }
    const user_id = shortid.generate();
    // ============== Create new  user ============
    const created_user = await prisma.user.create({
      data: {
        name,
        user_id,
        phone: normalizedPhone,
        password: bcrypt.hashSync(password, 10),
        is_verified: false,
        is_blocked: false,
      },
    });

    // ======================== decision maker ====================
    const decision = {
      is_create_user: false,
      is_send_otp: false,
    };
    // ========================= send otp =========================
    const otp = generate6DigitOtp();
    const otp_response = await send_message(
      [phone.split('+')[1]],
      `your account registration OTP is ${otp}. this code is valid for 5 min.
      Protigya Edu`
    );
    if (otp_response.success) {
      // ------- update decision
      decision.is_send_otp = true;
      // -------- otp save on db
      await prisma.otp.create({
        data: {
          otp_id: shortid.generate(),
          otp_type: 'registration',
          otp: bcrypt.hashSync(String(otp), 10),
          phone: normalizedPhone,
          expiry_date: new Date(Date.now() + 5 * 60 * 1000), //--- for 5 min
        },
      });
    }
    if (created_user.phone) {
      decision.is_create_user = true;
      // ======= set role
      await prisma.role.create({
        data: {
          role_id: shortid.generate(),
          user_id,
          phone,
        },
      });
    }
    // ===================== hide sensitive data ===============
    const { password: _, ...userWithoutPassword } = created_user;

    return responseGenerator(created_user.phone ? 201 : 500, res, {
      success: true,
      message: created_user.phone
        ? 'User registered successfully'
        : 'sorry, registrtion not completed',
      user: userWithoutPassword,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = registration_controller;
