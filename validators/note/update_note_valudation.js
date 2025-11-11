const { z } = require('zod');

const update_note_validation = z.object({
  note_name: z.string('Note name missing'),
  note_desc: z.string('Note description missing'),
  note_file_link: z.string('Note file missing'),
  shared_by: z.string('Author name missing'),
  slug: z.string('Slug missing'),
  note_id: z.string('Note ID missing'),
});

module.exports = update_note_validation;
