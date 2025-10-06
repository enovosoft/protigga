const responseGenerator = require('../../utils/responseGenerator');

const validate = (schema) => {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      // Clean and readable errors
      const result = schema.safeParse(req.body || req.params || req.query);

      if (!result.success) {
        // Access all issues
        const errors = result.error.issues.map((issue) => ({
          field: issue.path.join('.') || 'root',
          message: issue.message,
          expectedType: issue.expected,
          received: issue.received,
        }));
        const response_object = {
          success: false,
          message: 'Validation failed',
          errors,
        };
        return responseGenerator(400, res, response_object);
      }
      const errors = result.error;

      return responseGenerator(400, res, {
        success: false,
        message: 'Validation failed',
        errors,
      });
    }

    // Attach validated data
    req.validatedData = result.data;
    next();
  };
};

module.exports = validate;
