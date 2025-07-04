/**
  
 Defines a base class (BaseController) that contains 
 response methods that are common to all other Controllers in the application.
 
 **/

class BaseController {
    // Trả về phản hồi thành công với dữ liệu, thông điệp và mã trạng thái
    static successResponse(res, data, message = "Success", statusCode = 200, extra = {}) {
        return res.status(statusCode).json({
            success: true,
            message,
            data,
            ...extra 
        });
    }
    
    // Trả về phản hồi lỗi với thông điệp và mã trạng thái
    static errorResponse(res, error, message = "Server error", statusCode = 500) {
        console.error(error);
        return res.status(statusCode).json({
            success: false,
            message,
            error: error.message || error
        });
    }

    // Trả về phản hồi không tìm thấy với thông điệp
    static notFoundResponse(res, message = "Not found") {
        return res.status(404).json({
            success: false,
            message
        });
    }
}

module.exports = BaseController;
