const ErrorHandler = require("../utils/errorHandler");

module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.message = err.message || "Internal Server Error";

    if (err.name === "CastError") {
        err = new ErrorHandler(`Resource Not Found. Invalid: ${err.path}`, 400);
    }

    if (err.code === 11000) {
        err = new ErrorHandler(`Duplicate ${Object.keys(err.keyValue)} entered`, 400);
    }

    if (err.name === "ValidationError") {
        err = new ErrorHandler(
            Object.values(err.errors).map((item) => item.message).join(", "),
            400
        );
    }

    if (err.name === "JsonWebTokenError") {
        err = new ErrorHandler("Invalid authentication token", 401);
    }

    if (err.name === "TokenExpiredError") {
        err = new ErrorHandler("Your session has expired. Please login again", 401);
    }

    res.status(err.statusCode).json({
        success: false,
        message: err.message,
    });
};
