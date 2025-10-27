const { default: z } = require('zod');

const add_announcement_validation = z.object({
  title: z.string('Message required'),
  description: z.string('announcement descriptioon missing').optional(),
  course_id: z.string('course info missing'),
  attachment_url: z.string('annoucement URL missing').optional(),
  status: z.enum(['active', 'expired', 'draft']),
  start_date: z.iso.datetime('start date missing'),
  end_date: z.iso.datetime('end date missing'),
  is_send_sms: z.boolean('sms send status missing'),
});

module.exports = add_announcement_validation;
