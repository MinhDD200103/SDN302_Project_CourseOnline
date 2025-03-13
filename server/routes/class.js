const router = require('express').Router()
const classController = require('../controllers/class')
const { verifyAccessToken, isTeacher, isStudent } = require('../middlewares/verifyToken')
const { uploadImage, uploadFile, uploadMultiple } = require('../config/cloudinary.config')

router.get('/my-classes', verifyAccessToken, classController.getUserClasses)
router.get('/latest', classController.getLatestClasses)
router.get('/most-popular', classController.getPopularClasses)

router.get('/:cid', classController.getClassById)

router.post(
    "/",
    [verifyAccessToken, isTeacher],
    uploadMultiple,
    classController.createClass
);

router.put(
    '/:cid',
    [verifyAccessToken, isTeacher, uploadMultiple],
    classController.updateClass
);


router.put('/upload-image/:cid', [verifyAccessToken, isTeacher], uploadImage.single('image'), classController.uploadImageClass)

router.delete('/:cid', [verifyAccessToken, isTeacher], classController.deleteClass)

router.get('/', classController.getClasses)



module.exports = router