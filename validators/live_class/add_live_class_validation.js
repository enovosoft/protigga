const { default: z } = require('zod');

const add_live_class_validation = z.object({
  title: z.string('title must be given'),
  description: z.string('description must be given'),
  teacher_name: z.string('teacher_name must be given'),
  start_time: z.iso.datetime('start_time must be given'),
  end_time: z.iso.datetime('end_time must be given'),
  meeting_id: z.string('meeting_id must be given'),
  meeting_password: z.string('meeting_password must be given'),
  join_url: z.string('join_url must be given'),
  course_id: z.string('course id must be given'),
});

module.exports = add_live_class_validation;
