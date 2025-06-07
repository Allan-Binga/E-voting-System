const nodemailer = require("nodemailer");
const client = require("../config/db");
const dotenv = require("dotenv");
//Sign In WIth OTP email

dotenv.config();

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

//Send OTP Email
const sendOTPEmail = async (email, otp) => {
  const mailOptions = {
    from: `"e-Voting System" <${process.env.MAIL_USER}>`,
    to: email,
    subject: "Your One-Time Password (OTP)",
    html: `
      <div style="font-family: Arial, sans-serif; padding: 16px;">
        <h2>Hello Voter 👋</h2>
        <p>Your OTP is:</p>
        <h1 style="color: #2c3e50;">${otp}</h1>
        <p>This code will expire in 5 minutes.</p>
        <br />
        <p>Regards,</p>
        <strong>e-Voting System Team</strong>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending OTP email:", error);
    throw error;
  }
};

module.exports = { sendOTPEmail };
