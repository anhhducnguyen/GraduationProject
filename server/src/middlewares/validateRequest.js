module.exports = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path[0],
        message: detail.message.replace(/"/g, '')
      }));
      return res.status(400).json({ errors });
    }

    next();
  };
};
