const { default: z } = require('zod');

const update_enrollment_block_unblock_validation = z.object({
  enrollment_id: z.string('id is missing'),
  user_id: z.string('user details is missing'),
  expiry_date: z.iso.datetime('expiry date is missing'),
});

module.exports = update_enrollment_block_unblock_validation;
