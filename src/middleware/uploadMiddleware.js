// middleware/uploadMiddleware.js
require('dotenv').config()

const multer = require("multer");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");

const s3Client = new S3Client({
  region: process.env.REGION,
  credentials: {
    secretAccessKey: process.env.SECRET_ACCESS_KEY, 
    accessKeyId: process.env.ACCESS_KEY_ID,
  },
});

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    if (!file.originalname.match(/\.(gif|jpe?g|tiff?|png|webp|bmp)$/i)) {
      req.fileValidationError = "Only JPG OR PNG allowed!";
      return cb("Only .png and .jpg are allowed! ", false);
    } else if (file.size >= 1048576) {
      req.fileValidationError = "File size should be 10mb or less";
      return cb("File size should be 10mb or less", false);
    }
    cb(null, true);
  },
});

async function uploadFile(file) {
  const uploadParams = {
    Bucket: process.env.BUCKET_NAME,
    Key: `${Date.now().toString()}-${file.originalname}`,
    Body: file.buffer,
    ContentType: file.mimetype,
    ACL: "private",
    ServerSideEncryption: "AES256",
  };

  const uploadCommand = new PutObjectCommand(uploadParams);
  await s3Client.send(uploadCommand);

  const liveUrl = `https://${uploadParams.Bucket}.s3.${process.env.REGION}.amazonaws.com/${uploadParams.Key}`;
  return liveUrl;
}

module.exports = {
  uploadMiddleware: upload.single("file"),
  uploadFile,
};

