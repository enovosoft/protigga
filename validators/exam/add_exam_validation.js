const { default: z } = require('zod');

const add_exam_validation = z.object({
  enrollment_id: z.string('Enrollment id must be given'),
  exam_title: z.string('exam title missing'),
  exam_start_time: z.date('exam start time missing'),
  exam_end_time: z.date('exam end time missing'),
  exam_topic: z.date('exam topic time missing'),
  exam_description: z.date('exam description  missing'),
  exam_link: z.date('exam link missing'),
});

module.exports = add_exam_validation;
