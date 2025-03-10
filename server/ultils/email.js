const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false, // Bật nếu dùng port 465, tắt nếu dùng 587
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
    tls: {
        rejectUnauthorized: false, // Giúp tránh lỗi SSL
    },
});

// ✅ Hàm gửi email chuẩn MIME
const sendMail = async (to, subject, text, html) => {
    try {
        const info = await transporter.sendMail({
            from: `"Class Management" <no-reply@gmail.com>`, 
            to,
            subject,
            text,
            html, // Thêm HTML email để tăng độ tin cậy
            replyTo: process.env.SMTP_USER, // Giúp tránh bị đánh dấu spam
            messageId: `<${Date.now()}@yourdomain.com>`, // Định danh email hợp lệ
            headers: {
                "X-Mailer": "Nodemailer",
                "X-Priority": "3", // Email có độ ưu tiên bình thường
            },
            alternatives: [
                { contentType: "text/plain", content: text },
                { contentType: "text/html", content: html },
            ],
        });

        console.log("✅ Email sent successfully: ", info.messageId);
    } catch (error) {
        console.error("❌ Error sending email: ", error);
    }
};

module.exports = { sendMail };
