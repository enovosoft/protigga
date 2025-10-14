const { default: z } = require('zod');

const add_topic_validations = z.object({
  chapter_id: z.string('chapter id missing'),
  title: z.string('title missing'),
  youtube_url: z.string('video url missing'),
});

module.exports = add_topic_validations;
