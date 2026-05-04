const User = require("../models/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

let transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.NODE_MAIL,
    pass: process.env.NODE_PASS
  }
});

// REGISTER
const register = async (req, res) => {
  const { name, email, password, role, phone } = req.body;
  try {
    const saltround = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, saltround);

    const user = await User.create({
      name, email, password: hashedPassword, role, phone
    });

    const token = await jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Send welcome email
    try {
      const mailOptions = {
        from: process.env.NODE_MAIL,
        to: email,
        subject: `Welcome to the platform, ${name}`,
        html: `<h2>Welcome, ${name}!</h2>
               <p>Your account has been created successfully as a <strong>${role}</strong>.</p>
               <p>Start exploring properties today!</p>`
      };
      await transporter.sendMail(mailOptions);
      console.log("Welcome email sent");
    } catch (emailError) {
      console.log("WELCOME EMAIL FAILED:", emailError.message);
    }

    res.status(201).send({
      message: "User created successfully",
      data: { name, email, role, phone },
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

    const token = await jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "5h" }
    );

    res.status(200).send({
      message: "User logged in successfully",
      data: {
        id: user._id,
        email: user.email,
        role: user.role,
        name: user.name,
        phone: user.phone,
        createdAt: user.createdAt,
      },
      token,
    });

  } catch (error) {
    console.log(error);
    res.status(404).send({ message: "Invalid credentials" });
  }
};

module.exports = { register, login };