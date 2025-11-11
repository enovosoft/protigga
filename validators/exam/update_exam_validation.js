const { default: z } = require('zod');

const update_exam_validation = z.object({
  exam_id: z.string('exam id missing'),
  exam_title: z.string('exam title missing'),
  exam_start_time: z.iso.datetime('exam start time missing'),
  exam_end_time: z.iso.datetime('exam end time missing'),
  exam_topic: z.string('exam topic time missing'),
  exam_description: z.string('exam description  missing'),
  exam_link: z.string('exam link missing'),
});

module.exports = update_exam_validation;
