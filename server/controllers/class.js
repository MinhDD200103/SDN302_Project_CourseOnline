const asyncHandler = require("express-async-handler");
const slugify = require("slugify");
const Class = require("../models/Class");
const Lecture = require("../models/Lecture");
const Enrollment = require('../models/Enrollment');

// const createClass = asyncHandler(async (req, res) => {
//     const { _id } = req.user; // ID của giáo viên tạo lớp học

//     if (!req.body.title) throw new Error("Class title is required");

//     // Lấy đường dẫn ảnh lớp học (nếu có)
//     const imagePath = req.files?.image?.[0]?.path || "";

//     // 1️⃣ Tạo slug cho lớp học
//     const classSlug = slugify(req.body.title, { lower: true, strict: true });

//     // 2️⃣ Xử lý danh sách bài giảng
//     let lectureIds = [];
//     const lectureFiles = req.files?.lectureFiles || [];

//     if (!req.body.lectures || req.body.lectures.length === 0) {
//         throw new Error("A class must have at least one lecture");
//     }

//     for (let i = 0; i < req.body.lectures.length; i++) {
//         const { title, content = "" } = req.body.lectures[i];
//         if (!title) throw new Error(`Lecture ${i + 1} must have a title`);

//         const filePath = lectureFiles[i]?.path || ""; // Đường dẫn file trên Cloudinary
//         const originalFileName = lectureFiles[i]?.originalname || ""; // Lấy tên gốc của file

//         const lectureSlug = slugify(title, { lower: true });

//         const newLecture = await Lecture.create({
//             title,
//             slug: lectureSlug,
//             content,
//             file: filePath,
//             originalFileName
//         });

//         lectureIds.push(newLecture._id);
//     }

//     // 3️⃣ Tạo lớp học
//     const newClass = await Class.create({
//         title: req.body.title,
//         slug: classSlug,
//         description: req.body.description,
//         image: imagePath,
//         createdBy: _id,
//         lectures: lectureIds
//     });

//     if (!newClass) throw new Error("Failed to create class");

//     // 4️⃣ Populate dữ liệu trước khi trả về
//     const populatedClass = await Class.findById(newClass._id)
//         .populate("createdBy", "name email")
//         .populate("lectures", "title content file originalFileName")
//         .select("title description image lectures");

//     res.status(201).json({
//         success: true,
//         createdClass: populatedClass
//     });
// });


const createClass = asyncHandler(async (req, res) => {
    try {
        const { _id } = req.user; // ID của giáo viên tạo lớp học
        const { title, description } = req.body;
        let lectures = [];

        // Parse lectures from JSON string
        if (req.body.lectures) {
            lectures = JSON.parse(req.body.lectures);
        }

        if (!title) throw new Error("Class title is required");
        if (!lectures || lectures.length === 0) {
            throw new Error("A class must have at least one lecture");
        }

        // 1️⃣ Tạo slug cho lớp học
        const classSlug = slugify(title, { lower: true, strict: true });

        // Process image file if uploaded
        let imageUrl = '';
        if (req.files && req.files.image && req.files.image[0]) {
            imageUrl = req.files.image[0].path;
        }

        // 2️⃣ Xử lý danh sách bài giảng
        let lectureIds = [];
        for (let i = 0; i < lectures.length; i++) {
            const { title: lectureTitle, content = "" } = lectures[i];
            if (!lectureTitle) throw new Error(`Lecture ${i + 1} must have a title`);

            const lectureSlug = slugify(lectureTitle, { lower: true });
            
            // Check if there's a file for this lecture
            let fileUrl = '';
            let originalFileName = '';
            if (req.files && req.files.lectureFiles && req.files.lectureFiles[i]) {
                fileUrl = req.files.lectureFiles[i].path;
                originalFileName = req.files.lectureFiles[i].originalname;
            }

            const newLecture = await Lecture.create({
                title: lectureTitle,
                slug: lectureSlug,
                content,
                file: fileUrl,
                originalFileName
            });

            lectureIds.push(newLecture._id);
        }

        // 3️⃣ Tạo lớp học
        const newClass = await Class.create({
            title,
            slug: classSlug,
            description,
            image: imageUrl,
            createdBy: _id,
            lectures: lectureIds
        });

        if (!newClass) throw new Error("Failed to create class");

        // 4️⃣ Populate dữ liệu trước khi trả về
        const populatedClass = await Class.findById(newClass._id)
            .populate("createdBy", "name email")
            .populate("lectures", "title content file originalFileName")
            .select("title description image lectures");

        res.status(201).json({
            success: true,
            createdClass: populatedClass
        });
    } catch (error) {
        console.error("Error creating class:", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
});

const getClassById = asyncHandler(async (req, res) => {
    const { cid } = req.params;

    let query = Class.findById(cid)
        .populate('createdBy', 'name')
        .populate({
            path: 'lectures',
            select: 'title content file originalFileName',
        });

    const response = await query;

    if (!response) {
        return res.status(404).json({
            success: false,
            message: "Class not found"
        });
    }

    // Xử lý danh sách lectures với link tải đúng
    const lecturesWithDownloadLinks = response.lectures.map(lecture => {
        let fileUrl = lecture.file || null;
        let downloadLink = null;

        if (fileUrl) {
            if (fileUrl.includes('cloudinary.com')) {
                // Nếu file là Cloudinary URL, giữ nguyên đường dẫn
                downloadLink = fileUrl;
            } else {
                // Nếu file nằm trên server local, thêm URL_SERVER vào
                downloadLink = `${process.env.URL_SERVER}/upload/${lecture.file}`;
            }
        }

        return {
            _id: lecture._id,
            title: lecture.title,
            content: lecture.content,
            file: fileUrl,
            originalFileName: lecture.originalFileName,
            downloadLink: downloadLink
        };
    });

    return res.status(200).json({
        success: true,
        class: {
            _id: response._id,
            title: response.title,
            description: response.description,
            createdBy: response.createdBy,
            lectures: lecturesWithDownloadLinks,
            createdAt: response.createdAt,
            image: response.image,
        }
    });

});


const updateClass = asyncHandler(async (req, res) => {
    try {
        const { cid } = req.params;
        const { title, description } = req.body;
        let lectures = [];

        // Parse lectures from JSON string
        if (req.body.lectures) {
            lectures = JSON.parse(req.body.lectures);
        }

        // Find existing class
        const existingClass = await Class.findById(cid);
        if (!existingClass) {
            throw new Error("Class not found");
        }

        // 1️⃣ Cập nhật tiêu đề nếu có thay đổi
        if (title && title !== existingClass.title) {
            existingClass.title = title;
            existingClass.slug = slugify(title, { lower: true, strict: true });
        }

        // 2️⃣ Cập nhật mô tả nếu có thay đổi
        if (description !== undefined) {
            existingClass.description = description;
        }

        // 3️⃣ Cập nhật ảnh nếu có file mới
        let imageUrl = existingClass.image;
        if (req.files && req.files.image && req.files.image[0]) {
            imageUrl = req.files.image[0].path;
        }
        existingClass.image = imageUrl;

        // 4️⃣ Xử lý danh sách bài giảng
        let lectureIds = [...existingClass.lectures]; // Giữ nguyên các lecture cũ
        if (lectures && lectures.length > 0) {
            for (let i = 0; i < lectures.length; i++) {
                const { _id, title: lectureTitle, content = "" } = lectures[i];
                
                // Nếu lecture có ID tồn tại -> update
                if (_id) {
                    const existingLecture = await Lecture.findById(_id);
                    if (existingLecture) {
                        // Chỉ cập nhật khi có thay đổi
                        if (lectureTitle && lectureTitle !== existingLecture.title) {
                            existingLecture.title = lectureTitle;
                            existingLecture.slug = slugify(lectureTitle, { lower: true });
                        }
                        
                        if (content !== undefined) {
                            existingLecture.content = content;
                        }

                        // Cập nhật file nếu có file mới
                        if (req.files && req.files.lectureFiles && req.files.lectureFiles[i]) {
                            existingLecture.file = req.files.lectureFiles[i].path;
                            existingLecture.originalFileName = req.files.lectureFiles[i].originalname;
                        }

                        await existingLecture.save();
                    }
                } 
                // Nếu không có ID -> tạo mới lecture
                else {
                    if (!lectureTitle) throw new Error(`Lecture ${i + 1} must have a title`);

                    const lectureSlug = slugify(lectureTitle, { lower: true });
                    
                    let fileUrl = '';
                    let originalFileName = '';
                    if (req.files && req.files.lectureFiles && req.files.lectureFiles[i]) {
                        fileUrl = req.files.lectureFiles[i].path;
                        originalFileName = req.files.lectureFiles[i].originalname;
                    }

                    const newLecture = await Lecture.create({
                        title: lectureTitle,
                        slug: lectureSlug,
                        content,
                        file: fileUrl,
                        originalFileName
                    });

                    lectureIds.push(newLecture._id);
                }
            }
        }

        // Cập nhật danh sách lectures
        existingClass.lectures = lectureIds;

        // Lưu các thay đổi
        await existingClass.save();

        // 5️⃣ Populate dữ liệu trước khi trả về
        const populatedClass = await Class.findById(existingClass._id)
            .populate("createdBy", "name email")
            .populate("lectures", "title content file originalFileName")
            .select("title description image lectures");

        res.status(200).json({
            success: true,
            updatedClass: populatedClass
        });
    } catch (error) {
        console.error("Error updating class:", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
});

const getLatestClasses = asyncHandler(async (req, res) => {
    try {
        const latestClasses = await Class.find()
            .sort({ createdAt: -1 })
            .populate('createdBy', 'name')
            .limit(3)
            .select("title image createdAt lectures");

        return res.status(200).json({
            success: true,
            classes: latestClasses
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

const getPopularClasses = asyncHandler(async (req, res) => {
    const topClasses = await Enrollment.aggregate([
        {
            $group: {
                _id: "$classId",
                studentCount: { $sum: 1 }
            }
        },
        { $sort: { studentCount: -1 } },
        { $limit: 3 },
        {
            $lookup: {
                from: "classes",
                localField: "_id",
                foreignField: "_id",
                as: "classInfo"
            }
        },
        { $unwind: "$classInfo" },
        {
            $lookup: {
                from: "users",
                localField: "classInfo.createdBy",
                foreignField: "_id",
                as: "creatorInfo"
            }
        },
        { $unwind: "$creatorInfo" },
        {
            $project: {
                _id: "$classInfo._id",
                title: "$classInfo.title",
                image: "$classInfo.image",
                createdAt: "$classInfo.createdAt",
                studentCount: 1,
                creatorName: "$creatorInfo.name",
                creatorEmail: "$creatorInfo.email",
                lectures: "$classInfo.lectures",
            }
        }
    ]);

    if (!topClasses)
        throw new Error('Class not found')

    return res.status(200).json({
        success: true,
        classes: topClasses
    });
});

const getClasses = asyncHandler(async (req, res) => {
    const queries = { ...req.query };

    const excludeFields = ['limit', 'sort', 'page', 'fields'];
    excludeFields.forEach(item => delete queries[item]);

    let queryString = JSON.stringify(queries);
    queryString = queryString.replace(/\b(gte|gt|lt|lte)\b/g, matchedItem => `$${matchedItem}`);
    const formatedQueries = JSON.parse(queryString);

    if (queries?.title)
        formatedQueries.title = { $regex: queries.title, $options: 'i' };

    let queryCommand = Class.find(formatedQueries).populate('createdBy', 'name').select('-slug -description');

    if (req.query.sort) {
        const sortBy = req.query.sort.split(',').join(' ');
        queryCommand = queryCommand.sort(sortBy);
    } else {
        queryCommand = queryCommand.sort('-createdAt');
    }

    if (req.query.fields) {
        const fields = req.query.fields.split(',').join(' ');
        queryCommand = queryCommand.select(fields);
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 2;
    const skip = (page - 1) * limit;
    queryCommand = queryCommand.skip(skip).limit(limit);

    const classes = await queryCommand.exec();
    const totalCount = await Class.countDocuments(formatedQueries);

    return res.status(200).json({
        success: true,
        totalPages: Math.ceil(totalCount / limit),
        currentPage: page,
        totalCount,
        classes
    });
});



const deleteClass = asyncHandler(async (req, res) => {
    const { cid } = req.params

    const foundClass = await Class.findById(cid)
    if (!foundClass)
        return res.status(401).json({
            success: false,
            message: "Class not found"
        })

    const populatedClass = await Class.findById(foundClass._id)
        .populate('createdBy', 'name email')
        .populate({
            path: 'lectures',
            select: 'title content file originalFileName'
        })
        .select('title lectures');

    await Lecture.deleteMany({ _id: { $in: foundClass.lectures } })

    await Enrollment.deleteMany({ classId: foundClass._id })

    await Class.findByIdAndDelete(cid)

    return res.status(200).json({
        success: true,
        deletedClass: populatedClass
    });
});

const uploadImageClass = asyncHandler(async (req, res) => {
    const { cid } = req.params
    if (!req.file)
        throw new Error('Missing inputs')
    const response = await Class.findByIdAndUpdate(cid, { image: req.file.path }, { new: true })

    return res.status(200).json({
        success: response ? true : false,
        updatedProduct: response ? response : 'Cannot upload images product'
    })
});

module.exports = {
    createClass,
    getClasses,
    updateClass,
    deleteClass,
    getClassById,
    uploadImageClass,
    getLatestClasses,
    getPopularClasses
};