const multer = require("multer");
const path = require("path");

// Cấu hình lưu trữ
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../public/img_avatar"));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    let extension = path.extname(file.originalname);
    let fileName = file.fieldname + "-" + uniqueSuffix + extension;
    req.fileName = fileName;
    cb(null, fileName);
  },
});

const upload = multer({ storage });

module.exports = upload;
