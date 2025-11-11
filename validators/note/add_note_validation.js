const { z } = require('zod');

const add_note_validation = z.object({
  note_name: z.string('Note name missing'),
  note_desc: z.string('Note description missing'),
  note_file_link: z.string('Note file missing'),
  shared_by: z.string('Author name missing'),
});

module.exports = add_note_validation;
