const { default: z } = require('zod');

const add_course_validation = z.object({
  batch: z.string('Batch missing'),
  course_title: z.string('course title missing'),
  price: z.number('course price missing'),
  thumbnail: z.string('thumbnail missing'),
  related_books: z.array(z.string()).optional(),
  academy_name: z.string('academy name missing'),
  description: z.string('course description missing'),
  related_book: z.string("'Related book reference missing'"),
  quiz_count: z.number('Quiz count missing'),
  assessment: z.boolean('assesment missing'),
  skill_level: z.string('skill level missing'),
  expired_date: z.iso.datetime('expired date  missing'),
});
module.exports = add_course_validation;
