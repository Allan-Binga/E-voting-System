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
    from: `"Multimedia e-Voting System" <${process.env.MAIL_USER}>`,
    to: email,
    subject: "Your One-Time Password (OTP)",
    html: `
      <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f7fa; color: #333;">
        <!-- Header -->
        <div style="background-color: #1a73e8; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Multimedia e-Voting System</h1>
        </div>
        <!-- Body -->
        <div style="background-color: #ffffff; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h2 style="font-size: 20px; color: #1a73e8;">Hello👋</h2>
          <p style="font-size: 16px; line-height: 1.5;">Your one-time password (OTP) for secure voting is:</p>
          <div style="text-align: center; margin: 20px 0;">
            <h1 style="font-size: 36px; color: #1a73e8; letter-spacing: 4px; background-color: #f4f7fa; padding: 15px; display: inline-block; border-radius: 6px;">${otp}</h1>
          </div>
          <p style="font-size: 14px; color: #666; line-height: 1.5;">This code will expire in <strong>5 minutes</strong>. Please use it promptly to complete your authentication.</p>
          <p style="font-size: 14px; color: #666; line-height: 1.5;">If you did not request this OTP, please ignore this email or contact our support team.</p>
        </div>
        <!-- Footer -->
        <div style="text-align: center; padding: 20px; font-size: 12px; color: #666;">
          <p>Multimedia e-Voting System Team</p>
          <p>1234 Vote Securely Ave, Democracy City, DC 12345</p>
          <p><a href="#" style="color: #1a73e8; text-decoration: none;">Contact Support</a> | <a href="#" style="color: #1a73e8; text-decoration: none;">Unsubscribe</a></p>
          <p>&copy; ${new Date().getFullYear()} Multimedia e-Voting System. All rights reserved.</p>
        </div>
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

//Send Candidate Application
const sendCandidateApplicationEmail = async (email) => {
  const mailOptions = {
    from: `"Multimedia e-Voting System" <${process.env.MAIL_USER}>`,
    to: email,
    subject: "Your application has been submitted succesfully.",
    html: `
      <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f7fa; color: #333;">
        <!-- Header -->
        <div style="background-color: #1a73e8; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Multimedia e-Voting System</h1>
        </div>
        <!-- Body -->
        <div style="background-color: #ffffff; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h2 style="font-size: 20px; color: #1a73e8;">Hello Candidate,</h2>
          <p style="font-size: 16px; line-height: 1.5;">Thank you for submitting your application in the Multimedia e-Voting System.</p>
          <p style="font-size: 16px; line-height: 1.5;">Your application is now under review. Our officials will process it and notify you of the approval status soon.</p>
          <div style="text-align: center; margin: 20px 0;">
            <a href="#" style="background-color: #1a73e8; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-size: 16px; display: inline-block;">Check Application Status</a>
          </div>
          <p style="font-size: 14px; color: #666; line-height: 1.5;">If you have any questions, please reach out to our support team.</p>
        </div>
        <!-- Footer -->
        <div style="text-align: center; padding: 20px; font-size: 12px; color: #666;">
          <p>Multimedia e-Voting System Team</p>
          <p>Nairobi, Kenya</p>
          <p><a href="#" style="color: #1a73e8; text-decoration: none;">Contact Support</a> | <a href="#" style="color: #1a73e8; text-decoration: none;">Unsubscribe</a></p>
          <p>&copy; ${new Date().getFullYear()} Multimedia e-Voting System. All rights reserved.</p>
        </div>
      </div>
    `,
  };
  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending application email.", error);
    throw error;
  }
};

//Send Admin Candidate Approval Email
const sendAdminApplicationApprovalEmail = async (email) => {
  const mailOptions = {
    from: `"Multimedia e-Voting Management System" <${process.env.MAIL_USER}>`,
    to: email,
    subject: "New Candidate Application Awaits Your Approval",
    html: `
      <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f7fa; color: #333;">
        <!-- Header -->
        <div style="background-color: #1a73e8; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Multimedia e-Voting System</h1>
        </div>
        <!-- Body -->
        <div style="background-color: #ffffff; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h2 style="font-size: 20px; color: #1a73e8;">Hello Admin,</h2>
          <p style="font-size: 16px; line-height: 1.5;">A new candidate application has been submitted and requires your approval.</p>
          <p style="font-size: 16px; line-height: 1.5;">Please log in to the Multimedia e-Voting System to review and approve the application at your earliest convenience.</p>
          <div style="text-align: center; margin: 20px 0;">
            <a href="#" style="background-color: #1a73e8; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-size: 16px; display: inline-block;">Review Application</a>
          </div>
          <p style="font-size: 14px; color: #666; line-height: 1.5;">If you encounter any issues, please contact our technical support team.</p>
        </div>
        <!-- Footer -->
        <div style="text-align: center; padding: 20px; font-size: 12px; color: #666;">
          <p>Multimedia e-Voting System Team</p>
          <p>1234 Vote Securely Ave, Democracy City, DC 12345</p>
          <p><a href="#" style="color: #1a73e8; text-decoration: none;">Contact Support</a> | <a href="#" style="color: #1a73e8; text-decoration: none;">Unsubscribe</a></p>
          <p>&copy; ${new Date().getFullYear()} Multimedia e-Voting System. All rights reserved.</p>
        </div>
      </div>
    `,
  };
  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending application email.", error);
    throw error;
  }
};

// Send Application Approval/Rejection Email
const sendApprovalOrRejectionEmail = async (email, approval_status) => {
  const isApproved = approval_status === "Approved";
  const subject = isApproved
    ? "Your Candidate Application Has Been Approved"
    : "Your Candidate Application Was Not Approved";

  const messageBody = isApproved
    ? `<p style="font-size: 16px; line-height: 1.5;">Congratulations! Your application to become a candidate has been approved. You can now begin campaigning and participate in the election process.</p>`
    : `<p style="font-size: 16px; line-height: 1.5;">We regret to inform you that your application to become a candidate was not approved. Please ensure that all necessary requirements are met and consider reapplying in the future.</p>`;

  const ctaText = isApproved ? "View My Profile" : "Reapply";

  const mailOptions = {
    from: `"Multimedia e-Voting Management System" <${process.env.MAIL_USER}>`,
    to: email,
    subject: subject,
    html: `
      <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f7fa; color: #333;">
        <!-- Header -->
        <div style="background-color: ${isApproved ? "#34a853" : "#ea4335"}; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Multimedia e-Voting System</h1>
        </div>
        <!-- Body -->
        <div style="background-color: #ffffff; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h2 style="font-size: 20px; color: ${isApproved ? "#34a853" : "#ea4335"};">Hello Candidate,</h2>
          ${messageBody}
          <div style="text-align: center; margin: 20px 0;">
            <a href="#" style="background-color: ${isApproved ? "#34a853" : "#ea4335"}; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-size: 16px; display: inline-block;">
              ${ctaText}
            </a>
          </div>
          <p style="font-size: 14px; color: #666; line-height: 1.5;">If you have any questions, please reach out to our support team.</p>
        </div>
        <!-- Footer -->
        <div style="text-align: center; padding: 20px; font-size: 12px; color: #666;">
          <p>Multimedia e-Voting System Team</p>
          <p>1234 Vote Securely Ave, Democracy City, DC 12345</p>
          <p><a href="#" style="color: #1a73e8; text-decoration: none;">Contact Support</a> | <a href="#" style="color: #1a73e8; text-decoration: none;">Unsubscribe</a></p>
          <p>&copy; ${new Date().getFullYear()} Multimedia e-Voting System. All rights reserved.</p>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending approval/rejection email.", error);
    throw error;
  }
};


module.exports = {
  sendOTPEmail,
  sendCandidateApplicationEmail,
  sendAdminApplicationApprovalEmail,
  sendApprovalOrRejectionEmail,
};
