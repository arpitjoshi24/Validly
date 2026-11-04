import { ApiError } from '../utils/ApiError.js';

// Schemas look like: z.object({ body: ..., query: ..., params: ... })
// Validated data goes on req.validated. Unknown fields are stripped.
export const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse({
    body: req.body,
    query: req.query,
    params: req.params,
  });

  if (!result.success) {
    const details = result.error.issues.map((i) => ({
      field: i.path.slice(1).join('.'),
      message: i.message,
    }));
    return next(new ApiError(400, 'Validation failed', details));
  }

  req.validated = result.data;
  next();
};