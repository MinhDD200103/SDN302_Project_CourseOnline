const asyncHandler = require("express-async-handler");
const slugify = require("slugify");
const Class = require("../models/Class");
// const Part = require("../models/Part");
const Lecture = require("../models/Lecture");
const Enrollment = require('../models/Enrollment')


// const createClass = asyncHandler(async (req, res) => {
//     const { _id } = req.user; // ID người tạo lớp học (giảng viên)
//     console.log('Request body: ', req.body);
//     console.log('Request file (class image): ', req.file);

//     if (!req.body.title) throw new Error("Missing class title");

//     // Parse parts từ JSON nếu cần
//     const parsedParts = typeof req.body.parts === 'string' ? JSON.parse(req.body.parts) : req.body.parts;
//     if (!parsedParts || !Array.isArray(parsedParts) || parsedParts.length === 0) {
//         throw new Error("A class must have at least one Part");
//     }

//     // Đường dẫn ảnh của lớp học từ Cloudinary (được xử lý bởi uploadImage)
//     const imagePath = req.files && req.files.image ? req.files.image[0].path : ''

//     // 1️⃣ Tạo lớp học
//     const classSlug = slugify(req.body.title, { lower: true, strict: true });
//     const newClass = await Class.create({
//         title: req.body.title,
//         slug: classSlug,
//         description: req.body.description,
//         image: imagePath,
//         createdBy: _id
//     });
//     if (!newClass) throw new Error("Cannot create class");

//     // Lấy danh sách file bài giảng từ req.files (xử lý bởi uploadFile.array('lectureFile'))
//     const lectureFiles = req.files && req.files.lectureFile ? req.files.lectureFile : [];
//     let lectureFileIndex = 0;

//     // 2️⃣ Duyệt qua từng phần (Part)
//     const parts = await Promise.all(parsedParts.map(async (part) => {
//         if (!part.title) throw new Error("Each Part must have a title");
//         if (!part.lectures || !Array.isArray(part.lectures) || part.lectures.length === 0) {
//             throw new Error(`Part "${part.title}" must have at least one Lecture`);
//         }

//         // Tạo Part trong MongoDB
//         const newPart = await Part.create({
//             title: part.title,
//             classId: newClass._id
//         });

//         // 3️⃣ Duyệt qua các bài giảng của Part
//         const lectureIds = await Promise.all(part.lectures.map(async (lecture) => {
//             if (!lecture.title) throw new Error("Each Lecture must have a title");

//             const lectureSlug = slugify(lecture.title, { lower: true });

//             // Nếu có file được upload dành cho bài giảng này, lấy file từ mảng theo thứ tự
//             let lectureFilePath = '';
//             if (lectureFiles.length > lectureFileIndex) {
//                 lectureFilePath = lectureFiles[lectureFileIndex].path;
//                 lectureFileIndex++;
//             }

//             // Tạo Lecture trong MongoDB với file (nếu có) được upload từ Cloudinary
//             const newLecture = await Lecture.create({
//                 title: lecture.title,
//                 slug: lectureSlug,
//                 content: lecture.content || "",
//                 file: lectureFilePath || (lecture.file || "")
//             });

//             return newLecture._id; // Trả về ID của bài giảng vừa tạo
//         }));

//         // 4️⃣ Cập nhật danh sách bài giảng cho Part
//         newPart.lectureIds = lectureIds;
//         await newPart.save();

//         return newPart._id; // Trả về ID của Part
//     }));

//     // 5️⃣ Cập nhật danh sách Parts của lớp học
//     newClass.parts = parts;
//     await newClass.save();

//     // Populate dữ liệu trả về
//     const populatedClass = await Class.findById(newClass._id)
//         .populate('createdBy', 'name email')
//         .populate('students', 'email')
//         .populate({
//             path: 'parts',
//             select: 'title lectureIds',
//             populate: { path: 'lectureIds', select: 'title content file' }
//         })
//         .select('title parts image');

//     return res.status(201).json({
//         success: true,
//         createdClass: populatedClass
//     });
// });


const createClass = asyncHandler(async (req, res) => {
    const { _id } = req.user;  // ID of the instructor creating the class

    if (!req.body.title) throw new Error("Class title is required");

    // Get class image (if provided)
    const imagePath = req.files?.image?.[0]?.path || "";

    // 1️⃣ Create the class
    const classSlug = slugify(req.body.title, { lower: true, strict: true });

    // 2️⃣ Process lectures from form-data
    let lectureIds = [];
    const lectureFiles = req.files?.lectureFiles || [];

    // Iterate through lectures
    for (let i = 0; i < req.body.lectures.length; i++) {
        const title = req.body.lectures[i].title;
        const content = req.body.lectures[i].content || "";
        const filePath = lectureFiles[i] ? lectureFiles[i].path : "";

        if (!title) throw new Error(`Lecture ${i + 1} must have a title`);

        const lectureSlug = slugify(title, { lower: true });

        const newLecture = await Lecture.create({
            title,
            slug: lectureSlug,
            content,
            file: filePath
        });

        lectureIds.push(newLecture._id);
    }

    if (lectureIds.length === 0) throw new Error("A class must have at least one lecture");

    const newClass = await Class.create({
        title: req.body.title,
        slug: classSlug,
        description: req.body.description,
        image: imagePath,
        createdBy: _id
    });

    if (!newClass) throw new Error("Failed to create class");

    // 3️⃣ Assign lectures to the class
    newClass.lectures = lectureIds;
    await newClass.save();

    // 4️⃣ Populate data before returning the response
    const populatedClass = await Class.findById(newClass._id)
        .populate("createdBy", "name email")
        .populate("lectures", "title content file")
        .select("title description image lectures");

    res.status(201).json({
        success: true,
        createdClass: populatedClass
    });
});





const getClasses = asyncHandler(async (req, res) => {
    const queries = { ...req.query };

    const excludeFields = ['limit', 'sort', 'page', 'fields'];
    excludeFields.forEach(item => delete queries[item]);

    // Format lại các operators cho đúng cú pháp của mongoose
    let queryString = JSON.stringify(queries);
    queryString = queryString.replace(/\b(gte|gt|lt|lte)\b/g, matchedItem => `$${matchedItem}`);
    const formatedQueries = JSON.parse(queryString);

    // Filtering theo title (dùng regex để tìm kiếm không phân biệt hoa thường)
    if (queries?.title)
        formatedQueries.title = { $regex: queries.title, $options: 'i' };

    // Khởi tạo query
    let queryCommand = Class.find(formatedQueries).populate('createdBy', 'email').select('-students -parts'); //Tạm thời lấy email trước do chưa có tên lúc khởi tạo

    // Sorting (Sắp xếp)
    if (req.query.sort) {
        const sortBy = req.query.sort.split(',').join(' ');
        queryCommand = queryCommand.sort(sortBy);
    } else {
        queryCommand = queryCommand.sort('-createdAt');
    }

    // Fields Selection (Chọn các trường dữ liệu cụ thể)
    if (req.query.fields) {
        const fields = req.query.fields.split(',').join(' ');
        queryCommand = queryCommand.select(fields);
    }

    // Pagination (Phân trang)
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 1;
    const skip = (page - 1) * limit;
    queryCommand = queryCommand.skip(skip).limit(limit);

    // Execute Query
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


const getUserClasses = asyncHandler(async (req, res) => {
    const { _id, role } = req.user; // Lấy ID và vai trò của người dùng (sinh viên hoặc giảng viên)

    // Nếu là sinh viên → Lấy danh sách lớp mà sinh viên đã tham gia
    let query = role === "student" ? { students: _id } : { createdBy: _id };

    const classes = await Class.find(query)
        .populate('createdBy', 'name email') // Lấy thông tin giảng viên
        .select('title description createdBy createdAt');

    return res.status(200).json({
        success: true,
        classes
    });
});


// const getClassById = asyncHandler(async (req, res) => {
//     const { cid } = req.params
//     const { role } = req.user
//     if (role === "student") {
//         const response = await Class.findById(cid)
//             .populate('createdBy', 'email') 
//             .populate({
//                 path: 'parts',
//                 select: 'title lectures', // Chỉ lấy title và lectures của Part
//                 populate: { path: 'lectures', select: 'title content file' } 
//             })
//             .select('title parts'); 
//         return res.status(200).json({
//             success: response ? true : false,
//             message: response ? response : "Class not found"
//         })
//     }

//     const response = await Class.findById(cid)
//         .populate('createdBy', 'email').select('-_id')
//         .populate('students', 'email')
//         .populate({
//             path: 'parts',
//             select: 'title lectures -_id',
//             populate: { path: 'lectures', select: 'title content file -_id' }
//         })
//         .select('title lectures -_id')

//     return res.status(200).json({
//         success: response ? true : false,
//         message: response ? response : "Class not found"
//     })

// })

const getClassById = asyncHandler(async (req, res) => {
    const { cid } = req.params;
    const { role } = req.user;

    let query = Class.findById(cid)
        .populate('createdBy', 'email')
        .populate({
            path: 'parts',
            select: 'title lectureIds', // Chỉ lấy title và lectures của Part
            populate: { path: 'lectureIds', select: 'title content file' }
        })
        .select('title parts');

    // Nếu là giáo viên, lấy thêm danh sách sinh viên
    if (role === "teacher") {
        query = query.populate('students', 'email');
    }

    const response = await query;

    return res.status(200).json({
        success: response ? true : false,
        message: response ? response : "Class not found"
    });
});


const updateClass = asyncHandler(async (req, res) => {
    const { cid } = req.params;

    // Tìm lớp học trong database
    const foundClass = await Class.findById(cid);
    if (!foundClass) {
        return res.status(404).json({ success: false, message: "Class not found" });
    }

    // Cập nhật thông tin lớp học (chỉ cập nhật nếu có dữ liệu mới)
    if (req.body.title && req.body.title !== foundClass.title) {
        foundClass.title = req.body.title;
        foundClass.slug = slugify(req.body.title, { lower: true, strict: true });
    }

    if (req.body.description !== undefined) {
        foundClass.description = req.body.description;
    }

    // Xử lý ảnh lớp học (nếu có)
    if (req.files?.image) {
        foundClass.image = req.files.image[0].path; // Lưu URL ảnh từ Cloudinary
    }
    if (req.body.lectures && Array.isArray(req.body.lectures)) {
        const newLectureIds = new Set(foundClass.lectures.map(id => id.toString())); // Giữ ID cũ

        await Promise.all(req.body.lectures.map(async (lecture, index) => {
            if (!lecture.title || lecture.title.trim() === "") {
                throw new Error("Lecture title is required");
            }

            const lectureData = {
                title: lecture.title,
                slug: slugify(lecture.title, { lower: true }),
                content: lecture.content || "",
            };

            // Nếu có file bài giảng được tải lên, cập nhật file mới
            if (req.files?.lectureFiles && req.files.lectureFiles[index]) {
                lectureData.file = req.files.lectureFiles[index].path;
            }

            let lectureId;
            if (lecture._id) {
                // Nếu bài giảng đã tồn tại, cập nhật thông tin
                const existingLecture = await Lecture.findById(lecture._id);
                if (!existingLecture) {
                    throw new Error(`Lecture with ID ${lecture._id} not found`);
                }

                existingLecture.title = lecture.title || existingLecture.title;
                existingLecture.slug = slugify(existingLecture.title, { lower: true });
                existingLecture.content = lecture.content || existingLecture.content;

                if (lectureData.file) {
                    existingLecture.file = lectureData.file;
                }

                await existingLecture.save();
                lectureId = existingLecture._id;
            } else {
                // Nếu bài giảng chưa tồn tại, tạo mới
                const newLecture = await Lecture.create(lectureData);
                lectureId = newLecture._id;
            }

            newLectureIds.add(lectureId.toString()); // Thêm ID vào danh sách
        }));

        // Cập nhật danh sách bài giảng trong lớp học (giữ lại bài cũ + thêm bài mới)
        foundClass.lectures = Array.from(newLectureIds);
    }

    // Lưu thay đổi vào database
    await foundClass.save();

    // Populate lại dữ liệu trước khi trả về
    const populatedClass = await Class.findById(foundClass._id)
        .populate('createdBy', 'name email')
        .populate('lectures', 'title content file')
        .select('title description image lectures');

    return res.status(200).json({
        success: true,
        updatedClass: populatedClass
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
            select: 'title content file'
        })
        .select('title lectures');

    await Lecture.deleteMany({ _id: { $in: foundClass.lectures } })

    await Enrollment.deleteMany({ classId: foundClass._id })

    await Class.findByIdAndDelete(cid)

    return res.status(200).json({
        success: true,
        deletedClass: populatedClass
    });
})

const joinClass = asyncHandler(async (req, res) => {
    const { _id } = req.user
    const { cid } = req.params
    const foundClass = await Class.findById(cid)
    if (!foundClass)
        return res.status(400).json({
            success: false,
            message: "Class not found"
        })

    if (foundClass.students.includes(_id))
        return res.status(400).json({
            success: false,
            message: "Student already enrolled in this class"
        })

    foundClass.students.push(_id)
    await foundClass.save()

    const checkEnrollment = await Enrollment.findOne({ student: _id, classId: cid })
    if (checkEnrollment)
        return res.status(400).json({
            success: false,
            message: "Enrollment already exists"
        })

    const newEnrollment = await Enrollment.create({ student: _id, classId: cid })

    return res.status(200).json({
        success: true,
        message: "Successfully joined the class",
        class: foundClass,
        enrollment: newEnrollment
    });
})

const getOutClass = asyncHandler(async (req, res) => {
    const { _id } = req.user
    const { cid } = req.params
    const foundClass = await Class.findById(cid)
    if (!foundClass)
        return res.status(400).json({
            success: false,
            message: "Class not found"
        })

    if (!foundClass.students.includes(_id))
        return res.status(400).json({
            success: false,
            message: "Student is not enrolled in this class"
        })

    foundClass.students = foundClass.students.filter(studentId => studentId.toString() !== _id.toString())
    await foundClass.save()

    const checkEnrollment = await Enrollment.findOneAndDelete({ student: _id, classId: cid })
    if (!checkEnrollment)
        return res.status(400).json({
            success: false,
            message: "Enrollment is not exist"
        })

    return res.status(200).json({
        success: true,
        message: "Successfully left the class",
        enrollment: checkEnrollment,
        student: foundClass.students
    });
})

const uploadImageClass = asyncHandler(async (req, res) => {
    const { cid } = req.params
    if (!req.file)
        throw new Error('Missing inputs')
    // const response = await Class.findByIdAndUpdate(cid, { $push: { images: { $each: req.files.map(file => file.path) } } }, { new: true })
    const response = await Class.findByIdAndUpdate(cid, { image: req.file.path }, { new: true })

    return res.status(200).json({
        success: response ? true : false,
        updatedProduct: response ? response : 'Cannot upload images product'
    })
})
module.exports = {
    createClass,
    getClasses,
    updateClass,
    deleteClass,
    getClassById,
    getUserClasses,
    uploadImageClass
};
