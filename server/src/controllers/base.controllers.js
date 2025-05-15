/**
  
 Defines a base class (BaseController) that contains 
 response methods that are common to all other Controllers in the application.
 
 **/

class BaseController {
    static successResponse(res, data, message = "Success", statusCode = 200, extra = {}) {
        return res.status(statusCode).json({
            success: true,
            message,
            data,
            ...extra // Cho phép đính kèm pagination hoặc metadata khác
        });
    }
    

    static errorResponse(res, error, message = "Server error", statusCode = 500) {
        console.error(error);
        return res.status(statusCode).json({
            success: false,
            message,
            error: error.message || error
        });
    }

    static notFoundResponse(res, message = "Not found") {
        return res.status(404).json({
            success: false,
            message
        });
    }
}

module.exports = BaseController;
