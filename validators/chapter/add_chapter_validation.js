const { default: z } = require('zod');

const add_chapter_validation = z.object({
  course_id: z.string('curriculum id is missing'),
  title: z.string('title is missing'),
});

module.exports = add_chapter_validation;
