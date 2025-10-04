const { z } = require('zod');
const bangladeshPhoneRegex = /^\+8801[3-9]\d{8}$/;

const send_reset_otp_validation = z.object({
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
});

module.exports = send_reset_otp_validation;
