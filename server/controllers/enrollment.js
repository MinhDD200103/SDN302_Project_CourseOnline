const asyncHandler = require('express-async-handler')
const Class = require('../models/Class')
const Enrollment = require('../models/Enrollment')
const User = require('../models/User')

const enrollClass = asyncHandler(async (req, res) => {
    const { cid } = req.params
    const { _id } = req.user

    const foundClass = await Class.findById(cid)

    if (!foundClass)
        throw new Error('Cannot found class')

    const enrollment = await Enrollment.findOne({ classId: cid, student: _id })

    if (enrollment)
        throw new Error('Stundent already enrolled in the class')

    const newEnrollment = await Enrollment.create({
        classId: cid,
        student: _id,
    })

    if (!newEnrollment)
        throw new Error('Cannot create enrollment')

    const populatedRes = await Enrollment.findById(newEnrollment._id)
        .populate('classId', 'title')
        .populate('student', 'email')
        .select('student classId enrolledAt')

    return res.status(200).json({
        success: true,
        newEnrollment: populatedRes
    })
})

const leaveClass = asyncHandler(async (req, res) => {
    const { cid } = req.params
    const { _id } = req.user

    const foundClass = await Class.findById(cid)

    if (!foundClass)
        throw new Error('Cannot found class')

    const enrollment = await Enrollment.findOne({ classId: cid, student: _id })

    if (!enrollment)
        throw new Error('Stundent not enrolled in the class')

    const populatedRes = await Enrollment.findById(enrollment._id)
        .populate('classId', 'title')
        .populate('student', 'email')
        .select('student classId enrolledAt')

    const deletedEnroll = await Enrollment.findByIdAndDelete(enrollment._id)

    if (!deletedEnroll)
        throw new Error('Cannot create enrollment')

    return res.status(200).json({
        success: true,
        newEnrollment: populatedRes
    })
})

// const getEnrollment = asyncHandler(async (req, res) => {
//     const { cid } = req.params;
//     let queries = { ...req.query };

//     const foundClass = await Class.findById(cid);
//     if (!foundClass) {
//         throw new Error('Cannot find class');
//     }

//     // Loại bỏ các tham số không liên quan
//     const excludeFields = ['limit', 'sort', 'page', 'fields', 'email']; // Loại bỏ email luôn
//     excludeFields.forEach(item => delete queries[item]);

//     // Format lại các operators cho mongoose ($gte, $gt, $lte, $lt)
//     let queryString = JSON.stringify(queries);
//     queryString = queryString.replace(/\b(gte|gt|lt|lte)\b/g, matchedItem => `$${matchedItem}`);
//     const formatedQueries = JSON.parse(queryString);

//     let studentIds = [];

//     // Nếu có filter theo email, tìm student _id tương ứng
//     if (req.query.email) {
//         const students = await User.find({ email: { $regex: req.query.email, $options: 'i' } }).select('_id');
//         studentIds = students.map(s => s._id);

//         if (studentIds.length === 0) {
//             return res.status(200).json({ success: true, totalPages: 0, currentPage: 1, totalCount: 0, enrollments: [] });
//         }
//     }

//     // Lọc theo classId
//     formatedQueries.classId = cid;

//     // Nếu có studentIds, thêm vào query
//     if (studentIds.length > 0) {
//         formatedQueries.student = { $in: studentIds };
//     }

//     // Debug kiểm tra query sau khi đã tách email
//     // console.log("Final Query to Enrollment:", formatedQueries);

//     // Khởi tạo query
//     let queryCommand = Enrollment.find(formatedQueries)
//         .populate('student', 'name email') // Lấy thông tin sinh viên
//         // .populate('classId', 'title'); // Lấy thông tin lớp
//         .select('student enrolledAt')

//     // Sắp xếp (Sorting)
//     if (req.query.sort) {
//         const sortBy = req.query.sort.split(',').join(' ');
//         queryCommand = queryCommand.sort(sortBy);
//     } else {
//         queryCommand = queryCommand.sort('-enrolledAt');
//     }

//     // Lựa chọn các trường dữ liệu cụ thể (Fields Selection)
//     if (req.query.fields) {
//         const fields = req.query.fields.split(',').join(' ');
//         queryCommand = queryCommand.select(fields);
//     }

//     // Phân trang (Pagination)
//     const page = parseInt(req.query.page) || 1;
//     const limit = parseInt(req.query.limit) || 10;
//     const skip = (page - 1) * limit;
//     queryCommand = queryCommand.skip(skip).limit(limit);

//     // Thực thi truy vấn
//     const enrollments = await queryCommand.exec();
//     const totalCount = await Enrollment.countDocuments(formatedQueries);

//     return res.status(200).json({
//         success: true,
//         totalPages: Math.ceil(totalCount / limit),
//         currentPage: page,
//         totalCount,
//         enrollments
//     });
// });


const getEnrollment = asyncHandler(async (req, res) => {
    const { cid } = req.params;
    let queries = { ...req.query };

    const foundClass = await Class.findById(cid);
    if (!foundClass) {
        throw new Error('Cannot find class');
    }

    // Loại bỏ các tham số không liên quan
    const excludeFields = ['limit', 'sort', 'page', 'fields', 'email']; // Loại bỏ email luôn
    excludeFields.forEach(item => delete queries[item]);

    // Format lại các operators cho mongoose ($gte, $gt, $lte, $lt)
    let queryString = JSON.stringify(queries);
    queryString = queryString.replace(/\b(gte|gt|lt|lte)\b/g, matchedItem => `$${matchedItem}`);
    const formatedQueries = JSON.parse(queryString);

    let studentIds = [];

    // Nếu có filter theo email, tìm student _id tương ứng
    if (req.query.email) {
        const students = await User.find({ email: { $regex: req.query.email, $options: 'i' } }).select('_id');
        studentIds = students.map(s => s._id);

        if (studentIds.length === 0) {
            return res.status(200).json({ success: true, totalPages: 0, currentPage: 1, totalCount: 0, enrollments: [] });
        }
    }

    // Lọc theo classId
    formatedQueries.classId = cid;

    // Nếu có studentIds, thêm vào query
    if (studentIds.length > 0) {
        formatedQueries.student = { $in: studentIds };
    }

    // Khởi tạo query
    let queryCommand = Enrollment.find(formatedQueries)
        .populate('student', 'name email') // Lấy thông tin sinh viên
        .select('student enrolledAt');

    // Phân trang (Pagination)
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    queryCommand = queryCommand.skip(skip).limit(limit);

    // Thực thi truy vấn
    let enrollments = await queryCommand.exec();

    // Sắp xếp theo email của student
    enrollments.sort((a, b) => a.student.email.localeCompare(b.student.email));

    const totalCount = await Enrollment.countDocuments(formatedQueries);

    return res.status(200).json({
        success: true,
        totalPages: Math.ceil(totalCount / limit),
        currentPage: page,
        totalCount,
        enrollments
    });
});

const getUserClasses = asyncHandler(async (req, res) => {
    const { _id, role } = req.user

    let response;

    if (role === "student") {
        response = await Enrollment.find({ student: _id })
            .populate({
                path: 'classId',
                select: 'createdBy title lectures image',
                populate: {
                    path: 'createdBy',
                    select: 'name'  // Lấy thêm tên của giáo viên tạo lớp
                }
            });
    }
    else {
        // Nếu là giáo viên, lấy danh sách lớp mà họ đã tạo
        response = await Class.find({ createdBy: _id })
            .select('title lectures students image')
            .populate({
                path: 'createdBy',
                select: 'name email'
            });
    }

    return res.status(200).json({
        success: true,
        userClass: response
    });
});

module.exports = {
    enrollClass,
    leaveClass,
    getEnrollment,
    getUserClasses
}