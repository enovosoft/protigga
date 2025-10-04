const { z } = require('zod');

const bangladeshPhoneRegex = /^\+8801[3-9]\d{8}$/;

const change_password_validation = z.object({
  phone: z
    .string()
    .nonempty({ message: 'Phone number missing' })
    .refine(
      (val) => {
        // Validate directly if +880 present
        if (bangladeshPhoneRegex.test(val)) return true;

        // Try adding +88 if missing
        if (bangladeshPhoneRegex.test('+88' + val.replace(/^0/, '')))
          return true;

        return false;
      },
      { message: 'Invalid Bangladeshi phone number' }
    ),

  password: z
    .string()
    .nonempty({ message: 'Password missing' })
    .min(8, { message: 'Password must be at least 8 characters' })
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).+$/,
      {
        message:
          'Password must contain at least 1 uppercase, 1 lowercase, 1 number, and 1 special character',
      }
    ),

  prev_password: z.string().nonempty({ message: 'Previous password missing' }),
});

module.exports = change_password_validation;
