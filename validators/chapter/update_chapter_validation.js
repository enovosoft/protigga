const { default: z } = require('zod');

const update_chapter_validation = z.object({
  chapter_id: z.string('chapter id missing'),
  title: z.string('title is missing'),
});

module.exports = update_chapter_validation;
