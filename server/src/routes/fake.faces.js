const express = require('express');
const router = express.Router();
const cloudinary = require('../../config/cloudinary'); // nên dùng config riêng

router.get('/', async (req, res) => {
  try {
    // Lấy query params hoặc mặc định
    let page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;

    // Validate
    page = page < 1 ? 1 : page;
    limit = limit < 1 ? 10 : limit;
    const offset = (page - 1) * limit;

    // Lấy danh sách ảnh
    const result = await cloudinary.search
      .expression('folder:fake_faces_fullframe')
      .sort_by('created_at', 'desc')
      .max_results(500) // Cloudinary chỉ hỗ trợ max 500
      .execute();

    const allFiles = result.resources;
    const total = allFiles.length;
    const totalPages = Math.ceil(total / limit);
    const paginatedFiles = allFiles.slice(offset, offset + limit);

    const urls = paginatedFiles.map(file => ({
      url: file.secure_url,
      public_id: file.public_id,
      created_at: file.created_at,
      width: file.width,
      height: file.height,
      format: file.format,
    }));

    res.json({
      success: true,
      message: 'Lấy danh sách ảnh thành công.',
      data: {
        page,
        limit,
        total,
        totalPages,
        urls,
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Không thể lấy danh sách ảnh từ Cloudinary.',
      error: err.message
    });
  }
});

module.exports = router;
