const { default: z } = require('zod');

const update_topic_validation = z.object({
  chapter_topic_id: z.string('topic id missing'),
  title: z.string('title missing'),
  youtube_url: z.string('video url missing'),
});

module.exports = update_topic_validation;
