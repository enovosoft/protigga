const { z } = require('zod');

const verify_otp_validation = z.object({
  otp: z
    .string('OTP missing')
    .refine((val) => !isNaN(Number(val)), { message: 'OTP must be a number' })
    .refine((val) => /^\d{6}$/.test(val), {
      message: 'OTP must be exactly 6 digits',
    }),
  otp_type: z.string('OTP type must be given'),
});

module.exports = verify_otp_validation;
