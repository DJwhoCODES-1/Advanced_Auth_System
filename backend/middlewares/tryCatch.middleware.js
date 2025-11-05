const TryCatch = (handler) => {
  return async (req, res, next) => {
    try {
      await handler(req, res, next);
    } catch (error) {
      console.error("Error in handler:", error);

      if (!res.headersSent) {
        res.status(500).json({
          message: error.message || "Internal Server Error",
        });
      } else {
        res.end();
      }
    }
  };
};

export default TryCatch;
