export const errorHandler = (err, req, res, next) => {
  console.error('💥 Unhandled Error:', err)

  // Postgres unique constraint violation
  if (err.code === '23505') {
    return res.status(409).json({
      message: 'A record with that unique value already exists.',
      field: err.detail,
    })
  }

  // Postgres foreign key violation
  if (err.code === '23503') {
    return res.status(400).json({
      message: 'Referenced entity not found.',
    })
  }

  const statusCode = err.statusCode || res.statusCode === 200 ? 500 : res.statusCode
  res.status(statusCode).json({
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  })
}

export const notFoundHandler = (req, res) => {
  res.status(404).json({
    message: `API endpoint not found: [${req.method}] ${req.originalUrl}`,
  })
}
