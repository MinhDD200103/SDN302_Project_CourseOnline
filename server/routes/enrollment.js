const router = require('express').Router()
const enrollmentController = require('../controllers/enrollment')
const { isStudent, isTeacher, verifyAccessToken } = require('../middlewares/verifyToken')

router.get('/:cid', [verifyAccessToken, isTeacher], enrollmentController.getEnrollment)
router.post('/:cid', [verifyAccessToken, isStudent], enrollmentController.enrollClass)
router.delete('/:cid', [verifyAccessToken, isStudent], enrollmentController.leaveClass)

module.exports = router