const { default: z } = require('zod');

const delete_exam_validation = z.object({
  exam_id: z.string({ message: 'exam id missing' }),
});

module.exports = delete_exam_validation;
