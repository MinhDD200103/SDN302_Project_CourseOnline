const router = require('express').Router()
const userController = require('../controllers/user')
const {verifyAccessToken} = require('../middlewares/verifyToken')

router.post('/register', userController.register)
router.post('/login', userController.login)
router.get('/current', verifyAccessToken, userController.getCurrent)
router.post('/refreshtoken', userController.refreshAccessToken)
router.get('/logout', userController.logout)
router.get('/forgotpassword', userController.forgotPassword)
router.put('/resetpassword', userController.resetPassword)
router.put('/updateprofile',verifyAccessToken, userController.updateUser)

module.exports = router