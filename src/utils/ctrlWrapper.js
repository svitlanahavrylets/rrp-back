const ctrlWrapper = (controller) => {
  return async (req, res, next) => {
    try {
      await controller(req, res, next);
    } catch (err) {
      console.error('>>> ERROR createOrUpdateAboutController:', err);
      next(err);
    }
  };
};

export default ctrlWrapper;
