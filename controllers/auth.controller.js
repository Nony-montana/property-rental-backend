const User = require("../models/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const OTP = require("../models/otp.model");
const otpGenerator = require("otp-generator");

let transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.NODE_MAIL,
    pass: process.env.NODE_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

// REGISTER
const register = async (req, res) => {
  const { firstName, lastName, email, password, role, phone } = req.body;
  try {
    const saltround = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, saltround);

    const user = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role,
      phone,
    });

    const token = await jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" },
    );

    try {
      const mailOptions = {
        from: `"HomeFind" <${process.env.NODE_MAIL}>`,
        to: email,
        subject: `Welcome to HomeFind, ${firstName}! 🏠`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="margin: 0; padding: 0; background-color: #F4F4F4; font-family: Arial, sans-serif;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #F4F4F4; padding: 40px 0;">
              <tr>
                <td align="center">
                  <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
                    <tr>
                      <td style="background-color: #1A2E4A; padding: 30px 40px; text-align: center;">
                        <h1 style="color: #F5A623; margin: 0; font-size: 28px; letter-spacing: 1px;">
                          Home<span style="color: #ffffff;">Find</span>
                        </h1>
                        <p style="color: rgba(255,255,255,0.7); margin: 8px 0 0; font-size: 14px;">
                          Nigeria's Trusted Property Platform
                        </p>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 40px;">
                        <h2 style="color: #1A2E4A; margin: 0 0 16px;">
                          Welcome, ${firstName}! 🎉
                        </h2>
                        <p style="color: #555; line-height: 1.7; margin: 0 0 16px;">
                          Thank you for joining <strong>HomeFind</strong> — Nigeria's trusted platform for finding and listing properties.
                        </p>
                        <p style="color: #555; line-height: 1.7; margin: 0 0 24px;">
                          Your account has been created successfully as a <strong style="color: #F5A623;">${role}</strong>.
                        </p>
                        ${role === 'LANDLORD' ? `
                        <div style="background-color: #F4F4F4; border-left: 4px solid #F5A623; padding: 16px; border-radius: 0 8px 8px 0; margin-bottom: 24px;">
                          <p style="color: #1A2E4A; margin: 0; font-weight: bold;">As a Landlord you can:</p>
                          <ul style="color: #555; margin: 8px 0 0; padding-left: 20px; line-height: 1.8;">
                            <li>List your properties with photos</li>
                            <li>Manage your listings</li>
                            <li>Chat with potential tenants and buyers</li>
                          </ul>
                        </div>
                        ` : `
                        <div style="background-color: #F4F4F4; border-left: 4px solid #F5A623; padding: 16px; border-radius: 0 8px 8px 0; margin-bottom: 24px;">
                          <p style="color: #1A2E4A; margin: 0; font-weight: bold;">As a ${role === 'RENT' ? 'Tenant' : 'Buyer'} you can:</p>
                          <ul style="color: #555; margin: 8px 0 0; padding-left: 20px; line-height: 1.8;">
                            <li>Browse verified properties across Nigeria</li>
                            <li>Search by location and property type</li>
                            <li>Chat directly with landlords</li>
                          </ul>
                        </div>
                        `}
                        <div style="text-align: center; margin: 30px 0;">
                          <a href="http://localhost:3001"
                            style="background-color: #1A2E4A; color: #ffffff; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px; display: inline-block;">
                            Start Exploring Properties
                          </a>
                        </div>
                        <p style="color: #999; font-size: 13px; line-height: 1.6; margin: 0;">
                          If you did not create this account, please ignore this email or contact us at
                          <a href="mailto:homefind.support@gmail.com" style="color: #F5A623;">homefind.support@gmail.com</a>
                        </p>
                      </td>
                    </tr>
                    <tr>
                      <td style="background-color: #F4F4F4; padding: 20px 40px; text-align: center; border-top: 1px solid #e0e0e0;">
                        <p style="color: #999; font-size: 12px; margin: 0;">
                          © ${new Date().getFullYear()} HomeFind. All rights reserved.
                        </p>
                        <p style="color: #999; font-size: 12px; margin: 4px 0 0;">
                          Lagos, Nigeria | homefind.support@gmail.com
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </body>
          </html>
        `,
      };
      await transporter.sendMail(mailOptions);
      console.log("Welcome email sent");
    } catch (emailError) {
      console.log("WELCOME EMAIL FAILED:", emailError.message);
    }

    // Set cookie on register too
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 1000, // 1 hour
    });

    res.status(201).send({
      message: "User created successfully",
      data: { firstName, lastName, email, role, phone },
      token,
    });
  } catch (error) {
    console.log(error);
    if (error.code == 11000) {
      return res.status(400).send({ message: "User already exists" });
    }
    res.status(400).send({ message: "User creation failed" });
  }
};

// LOGIN
const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(404).send({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(404).send({ message: "Invalid credentials" });
    }

    if (user.isActive === false) {
      return res.status(403).send({
        message: "Your account has been deactivated. Please contact support.",
      });
    }

    const token = await jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "24h" },
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.status(200).send({
      message: "User logged in successfully",
      data: {
        id: user._id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        isVerified: user.isVerified,
        isActive: user.isActive,
        createdAt: user.createdAt,
      },
      token,
    });
  } catch (error) {
    console.log(error);
    res.status(404).send({ message: "Invalid credentials" });
  }
};

// REQUEST OTP
const requestOTP = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).send({ message: "Account not found" });
    }

    const otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      specialChars: false,
      lowerCaseAlphabets: false,
      digits: true,
    });

    await OTP.create({ email, otp });

    const mailOptions = {
      from: `"HomeFind" <${process.env.NODE_MAIL}>`,
      to: email,
      subject: "HomeFind — Password Reset OTP 🔐",
      html: `
        <!DOCTYPE html>
        <html>
        <body style="margin: 0; padding: 0; background-color: #F4F4F4; font-family: Arial, sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #F4F4F4; padding: 40px 0;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
                  <tr>
                    <td style="background-color: #1A2E4A; padding: 30px 40px; text-align: center;">
                      <h1 style="color: #F5A623; margin: 0; font-size: 28px; letter-spacing: 1px;">
                        Home<span style="color: #ffffff;">Find</span>
                      </h1>
                      <p style="color: rgba(255,255,255,0.7); margin: 8px 0 0; font-size: 14px;">
                        Password Reset Request
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 40px; text-align: center;">
                      <h2 style="color: #1A2E4A; margin: 0 0 16px;">
                        Reset Your Password 🔐
                      </h2>
                      <p style="color: #555; line-height: 1.7; margin: 0 0 24px;">
                        You requested a password reset for your HomeFind account. Use the OTP below to reset your password.
                      </p>
                      <div style="background-color: #F4F4F4; border: 2px dashed #F5A623; border-radius: 12px; padding: 24px; margin: 0 0 24px;">
                        <p style="color: #999; font-size: 13px; margin: 0 0 8px;">Your OTP Code</p>
                        <h1 style="color: #1A2E4A; font-size: 48px; letter-spacing: 16px; margin: 0; font-weight: bold;">
                          ${otp}
                        </h1>
                        <p style="color: #dc3545; font-size: 13px; margin: 8px 0 0;">
                          ⏱ Expires in 5 minutes
                        </p>
                      </div>
                      <p style="color: #555; line-height: 1.7; margin: 0 0 16px;">
                        Enter this code on the password reset page to create a new password.
                      </p>
                      <p style="color: #999; font-size: 13px; line-height: 1.6; margin: 0;">
                        If you didn't request this, please ignore this email. Your account is safe.
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td style="background-color: #F4F4F4; padding: 20px 40px; text-align: center; border-top: 1px solid #e0e0e0;">
                      <p style="color: #999; font-size: 12px; margin: 0;">
                        © ${new Date().getFullYear()} HomeFind. All rights reserved.
                      </p>
                      <p style="color: #999; font-size: 12px; margin: 4px 0 0;">
                        Lagos, Nigeria | homefind.support@gmail.com
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);
    res.status(200).send({ message: "OTP sent successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Failed to send OTP" });
  }
};

// RESET PASSWORD WITH OTP
const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;
  try {
    const otpRecord = await OTP.findOne({ email });
    if (!otpRecord) {
      return res.status(400).send({ message: "OTP expired or not found" });
    }
    if (otpRecord.otp !== otp) {
      return res.status(400).send({ message: "Invalid OTP" });
    }
    const saltRound = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, saltRound);
    await User.findOneAndUpdate({ email }, { password: hashedPassword });
    await OTP.deleteOne({ email });
    res.status(200).send({ message: "Password reset successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Failed to reset password" });
  }
};

// CHANGE PASSWORD
const changePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  try {
    const user = await User.findById(req.user.id).select("+password");
    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).send({ message: "Current password is incorrect" });
    }
    const saltRound = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, saltRound);
    await User.findByIdAndUpdate(req.user.id, { password: hashedPassword });
    res.status(200).send({ message: "Password changed successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Failed to change password" });
  }
};

// LOGOUT
const logoutUser = (req, res) => {
  res.cookie('token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    expires: new Date(0),
  });
  res.status(200).send({ message: "Logged out successfully" });
};

module.exports = { register, login, requestOTP, resetPassword, changePassword, logoutUser };