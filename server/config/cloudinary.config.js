const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const path = require('path');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET
});

// Lưu ảnh lớp học
const imageStorage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'classmanagement/classes',
        allowedFormats: ['jpg', 'png'],
    }
});

const fileStorage = new CloudinaryStorage({
    cloudinary,
    params: async (req, file) => {
        let originalName = path.parse(file.originalname).name.trim();
        originalName = originalName.replace(/\s+/g, "_");

        return {
            folder: "classmanagement/lectures",
            allowedFormats: ["pdf", "docx", "pptx"],
            resource_type: "raw", // Đặt rõ resource_type là raw
            public_id: originalName, 
        };
    }
});

const uploadMultiple = multer({
    storage: new CloudinaryStorage({
        cloudinary,
        params: async (req, file) => {
            let originalName = path.parse(file.originalname).name.trim();
            originalName = originalName.replace(/\s+/g, "_");

            if (file.mimetype.startsWith("image/")) {
                return { 
                    folder: "classmanagement/classes", 
                    allowedFormats: ["jpg", "png"] 
                };
            } else {
                return {
                    folder: "classmanagement/lectures",
                    allowedFormats: ["pdf", "docx", "pptx"],
                    resource_type: "raw", // Sửa từ "auto" thành "raw"
                    public_id: originalName
                };
            }
        },
    }),
}).fields([
    { name: "image", maxCount: 1 },
    { name: "lectureFiles", maxCount: 10 }
]);

const uploadImage = multer({ storage: imageStorage });
const uploadFile = multer({ storage: fileStorage });

module.exports = { uploadImage, uploadFile, uploadMultiple };