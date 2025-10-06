const responseGenerator = require('../../utils/responseGenerator');

const validate_schema = (schema, data, res, next) => {
  const result = schema.safeParse(data || {});

  if (result.success) {
    return { success: true, message: 'validation success' };
  }
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
    return response_object;
  }
};

module.exports = validate_schema;
