const User = require('../models/User');
const asyncHandler = require('express-async-handler');
// const bcrypt = require('bcrypt');
const { sendMail } = require('../ultils/email');
const { generateAccessToken, generateRefreshToken } = require('../middlewares/jwt')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')

const register = asyncHandler(async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({
            success: false,
            message: "Missing email input",
        });
    }

    // Kiểm tra nếu email đã tồn tại
    let user = await User.findOne({ email });
    if (user)
        throw new Error('Email đã được đăng ký!')
    else {
        // Tạo mật khẩu ngẫu nhiên
        const randomPassword = Math.random().toString(36).slice(-8);
        // const hashedPassword = await bcrypt.hash(randomPassword, 10);

        // Lưu user vào database
        user = new User({ email, password: randomPassword });
        await user.save();

        // Nội dung email
        const subject = "Your Account Details";
        const textContent = `Xin chào,\n\nTài khoản của bạn đã được tạo thành công.\nMật khẩu đăng nhập của bạn: ${randomPassword}\n\nVui lòng thay đổi mật khẩu sau khi đăng nhập.\n\nTrân trọng`;
        const htmlContent = `
        <p>Xin chào,</p>
        <p><strong>Tài khoản của bạn đã được tạo thành công!</strong></p>
        <p><strong>Mật khẩu đăng nhập của bạn: </strong> <code>${randomPassword}</code></p>
        <p>Vui lòng thay đổi mật khẩu sau khi đăng nhập.</p>
        <p>Trân trọng</p>`;


        // Gửi email cho người dùng
        await sendMail(email, subject, textContent, htmlContent);

        res.status(200).json({
            success: true,
            message: "Mật khẩu đã được gửi đến email của bạn. Vui lòng kiểm tra hộp thư đến hoặc thư rác.",
        });
    }
});

const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body
    if (!email || !password)
        return res.status(400).json({
            success: false,
            mes: 'Missing input'
        })
    const response = await User.findOne({ email })

    if (response && await response.isCorrectPassword(password)) {
        //Tách password và role ra khỏi response
        const { password, role, refreshToken, ...userData } = response.toObject()
        //Tạo access token
        const accessToken = generateAccessToken(response._id, role)
        //Tạo refresh token
        const newRefreshToken = generateRefreshToken(response._id)
        //Lưu refresh token vào db
        await User.findByIdAndUpdate(response._id, { refreshToken: newRefreshToken }, { new: true })
        //Lưu refresh token vào cookie
        res.cookie('refreshToken', newRefreshToken, { httpOnly: true, maxAge: 2 * 24 * 60 * 60 * 1000 })
        return res.status(200).json({
            success: true,
            accessToken: accessToken,
            userData: userData
        })
    }
    else {
        throw new Error('Invalid credentials')
    }
})

const getCurrent = asyncHandler(async (req, res) => {
    const { _id } = req.user
    const user = await User.findById(_id).select('-role -password -refreshToken')
    if (user) {
        return res.status(200).json({
            success: true,
            data: user
        })
    }
    return res.status(400).json({
        success: false,
        message: 'User not found'
    })
})

const refreshAccessToken = asyncHandler(async (req, res) => {
    const cookie = req.cookies
    if (!cookie && !cookie.refreshToken)
        throw new Error('No refresh token in cookies')

    const rs = await jwt.verify(cookie.refreshToken, process.env.JWT_SECRET)
    const response = await User.findOne({ _id: rs._id, refreshToken: cookie.refreshToken })
    return res.status(200).json({
        success: response ? true : false,
        newAccessToken: response ? generateAccessToken(response._id, response.role) : 'Refresh token not matched'
    })

})

const logout = asyncHandler(async (req, res) => {
    const cookie = req.cookies
    if (!cookie || !cookie.refreshToken)
        throw new Error('No refresh token in cookies')
    await User.findOneAndUpdate({ refreshToken: cookie.refreshToken }, { refreshToken: '' }, { new: true })
    res.clearCookie('refreshToken', { httpOnly: true, secure: true })
    return res.status(200).json({
        success: true,
        message: 'Logout'
    })
})

const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.query
    if (!email)
        throw new Error('Missing email')
    const user = await User.findOne({ email })
    if (!user)
        throw new Error('User not found')
    const resetToken = user.createPasswordChangedToken()
    await user.save()

    const subject = "Your New Password";
    const textContent = ``;
    const htmlContent = `Xin vui lòng click vào link dưới đây để thay đổi mật khẩu của bạn.\n
    Link này sẽ hết hạn sau 15 phút\n
    <a href=${process.env.URL_SERVER}/api/user/reset-password/${resetToken}>Click here</a>`
    await sendMail(email, subject, textContent, htmlContent);
    res.status(200).json({
        success: true,
        message: "Hãy kiểm tra email của bạn để có thể đổi mật khẩu",
    });
})

const resetPassword = asyncHandler(async (req, res) => {
    const { token, password } = req.body
    if (!password || !token)
        return res.status(400).json({
            success: false,
            message: 'Missing input'
        })
    const passwordResetToken = crypto.createHash('sha256').update(token).digest('hex')
    const user = await User.findOne({ passwordResetToken, passwordResetExprires: { $gt: Date.now() } })
    if (!user)
        throw new Error('Invalid reset token')
    user.password = password
    user.passwordResetToken = undefined
    user.passwordChangedAt = Date.now()
    user.passwordResetExprires = undefined
    await user.save()

    return res.status(200).json({
        success: user ? true : false,
        message: user ? 'Updated password' : 'Something went wrong'
    })
})

const updateUser = asyncHandler(async (req, res) => {
    const { _id } = req.user
    const { name } = req.body
    const user = await User.findByIdAndUpdate(_id, { name: name }, { new: true }).select('-role -password -refreshToken')
    return res.status(200).json({
        success: user ? true : false,
        message: user ? user : "User not found"
    })
})


module.exports = {
    register,
    login,
    getCurrent,
    refreshAccessToken,
    logout,
    forgotPassword,
    resetPassword,
    updateUser
};
