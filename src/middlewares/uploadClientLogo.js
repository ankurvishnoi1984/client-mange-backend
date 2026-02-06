const multer = require("multer");
const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

const uploadDir = "/uploads";

// Ensure upload directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer: store file in memory (NOT disk)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: (req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only JPG, PNG, WEBP images allowed"));
    }
  }
});

// Image compression middleware
const compressClientLogo = async (req, res, next) => {
  if (!req.file) return next();

  try {
    const ext = ".webp"; // convert everything to webp
    const filename = `client_${Date.now()}${ext}`;
    const filepath = path.join(uploadDir, filename);

    await sharp(req.file.buffer)
      .resize(300, 300, { fit: "inside" }) // resize max 300x300
      .webp({ quality: 80 })              // compress
      .toFile(filepath);

    // Attach filename to request
    req.file.filename = filename;
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = {
  uploadClientLogo: upload.single("clientlogo"),
  compressClientLogo
};
