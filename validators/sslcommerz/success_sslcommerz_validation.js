const { z } = require('zod');

const success_sslcommerz_validation = z.object({
  tran_id: z.string().min(1, 'tran_id is required'),
  meterial_type: z.string().min(1, 'meterial_type is required'),
});

module.exports = success_sslcommerz_validation;
