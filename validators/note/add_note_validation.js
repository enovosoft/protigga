const { z } = require('zod');

const add_note_validation = z.object({
  note_name: z.string().nonempty({ message: 'Note name missing' }),
  note_desc: z.string().nonempty({ message: 'Note description missing' }),
  note_file_link: z.string().nonempty({ message: 'Note file missing' }),
  shared_by: z.string().nonempty({ message: 'Author name missing' }),
});

module.exports = add_note_validation;
