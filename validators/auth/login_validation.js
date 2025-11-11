const { z } = require('zod');

// Regex for +8801XXXXXXXXX
const bangladeshPhoneRegex = /^\+8801[3-9]\d{8}$/;

const login_validation = z.object({
  phone: z.string('Phone number missing').refine(
    (val) => {
      // Validate directly if +880 present
      if (bangladeshPhoneRegex.test(val)) return true;

      // Try adding +88 if missing
      if (bangladeshPhoneRegex.test('+88' + val.replace(/^0/, ''))) return true;

      return false;
    },
    { message: 'Invalid Bangladeshi phone number' }
  ),

  password: z
    .string('Password missing')
    .min(8, { message: 'Password must be at least 8 characters' })
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).+$/,
      {
        message:
          'Password must contain at least 1 uppercase, 1 lowercase, 1 number, and 1 special character',
      }
    ),
});

module.exports = login_validation;
