export const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    status: 404,
    success: false,
    message: 'Stránka nenalezena',
  });
};
