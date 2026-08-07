const multer = require("multer");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const fs = require("fs");
const { v2: cloudinary } = require("cloudinary");
const { CloudinaryStorage } = require("multer-storage-cloudinary");

const useCloudinary = !!(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET);

if (useCloudinary) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

function createUploadMiddleware(folder) {
  // Cloudinary storage persists uploads outside the app's own filesystem, so files
  // survive redeploys — Render's local disk is wiped on every deploy/restart.
  // Falls back to local disk when Cloudinary isn't configured (e.g. local dev).
  const storage = useCloudinary
    ? new CloudinaryStorage({
        cloudinary,
        params: {
          folder: `smart-inverters/${folder}`,
          public_id: () => uuidv4(),
          allowed_formats: ["jpeg", "jpg", "png", "webp", "gif"],
        },
      })
    : (() => {
        const uploadPath = path.join(process.env.UPLOAD_DIR || "./uploads", folder);
        if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });
        return multer.diskStorage({
          destination: (req, file, cb) => cb(null, uploadPath),
          filename: (req, file, cb) => {
            const ext = path.extname(file.originalname).toLowerCase();
            cb(null, `${uuidv4()}${ext}`);
          },
        });
      })();

  const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp|gif/;
    const extName = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimeType = allowedTypes.test(file.mimetype);
    if (extName && mimeType) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"), false);
    }
  };

  return multer({
    storage,
    fileFilter,
    limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024 },
  });
}

module.exports = { createUploadMiddleware, useCloudinary };
