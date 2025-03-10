const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET
});

// const storage = new CloudinaryStorage({
//     cloudinary,
//     allowedFormats: ['jpg', 'png'],
//     params: {
//         folder: 'classmanagement'
//     }
// });

const imageStorage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'classmanagement/classes',
        allowedFormats: ['jpg', 'png'],
    }
});

// Storage cho file bài giảng của Lecture
const fileStorage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'classmanagement/lectures',
        allowedFormats: ['pdf', 'docx', 'pptx'],
        resource_type: 'raw' 
    }
});

const uploadMultiple = multer({
    storage: new CloudinaryStorage({
        cloudinary,
        params: async (req, file) => {
            if (file.mimetype.startsWith("image/")) {
                return { folder: "classmanagement/classes", allowedFormats: ["jpg", "png"] };
            } else {
                return { folder: "classmanagement/lectures", allowedFormats: ["pdf", "docx", "pptx"], resource_type: "raw" };
            }
        },
    }),
}).fields([
    { name: "image", maxCount: 1 }, // Ảnh lớp học
    { name: "lectureFiles", maxCount: 10 } // Tối đa 10 file bài giảng
]);

const uploadImage = multer({ storage: imageStorage });
const uploadFile = multer({ storage: fileStorage });

module.exports = { uploadImage, uploadFile, uploadMultiple };
