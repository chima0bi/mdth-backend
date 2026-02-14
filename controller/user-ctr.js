import dotenv from "dotenv";
dotenv.config();
// import cloudinary from "../config/cloudnary.js";

// import SibApiV3Sdk from "sib-api-v3-sdk";
// import streamifier from "streamifier";
// import User from "../module/userModule.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import sendmail from "../utilities/mailer.js";
import crypto from "crypto";
import User from "../model/user-model.js";

const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};

// Temporary in-memory store for unverified users
const pendingUsers = new Map();

//define sendMail
const sendMail = (purpose, email, htmlContent) => {
  const mailOptions = {
    from: `"Making A Difference Tech Hub" <${process.env.EMAIL_USER_NAME}>`,
    to: email,
    subject: `MDTH - ${purpose}`,
    html: htmlContent,
  };

  // send email but do not block registration flow on SMTP timeouts/errors
  sendmail(mailOptions)
    .then((info) =>
      console.log(
        `✅ ${purpose} email sent to ${email}`,
        info?.messageId || "",
      ),
    )
    .catch((err) =>
      console.error(`Failed to send ${purpose} email (non-blocking):`, err),
    );
};

/**
 * REGISTER USER (Stage 1)
 * Generate OTP and send verification email
 */
export const registerUser = async (req, res) => {
  try {
    const { fullName, email, password, phone, country, acceptedTerms } =
      req.body;

    // Basic validations
    if (!fullName || !email || !password)
      return res.status(403).json({
        message: "fullname, email and password are required for registration",
      });

    if (password.length < 5)
      return res
        .status(400)
        .json({ message: "Password must exceed 5 characters" });

    if (acceptedTerms !== true && acceptedTerms !== "true")
      return res
        .status(400)
        .json({ message: "Please accept the terms & conditions" });

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res
        .status(400)
        .json({ message: "Email already registered, proceed to login" });

    // ✅ Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // ✅ Generate 6-digit OTP
    const verificationCode = generateOTP();

    // ✅ Save temporarily in memory
    pendingUsers.set(email, {
      fullName,
      email,
      hashedPassword,
      phone,
      country,
      acceptedTerms,
      //   profilePhoto,
      verificationCode,
      createdAt: Date.now(),
    });

    // ✅ Construct email content
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; line-height:1.6;">
        <h2 style="color: green;">Welcome, ${fullName} 👋</h2>
        <p>Thank you for registering with <strong>Making a Difference Tech Hub (MDTH)</strong>.</p>
        <p>Your verification code is:</p>
        <h1 style="background:green;color:#fff;display:inline-block;padding:10px 20px;border-radius:8px;">
          ${verificationCode}
        </h1>
        <p>This code expires in <b>10 minutes</b>.</p>
      </div>
    `;

    const purpose = "Email Verification";
    sendMail(purpose, email, htmlContent);

    // ✅ Send success response
    res.status(200).json({
      message:
        "Verification code sent to your email. Please check your inbox or spam folder.",
    });
  } catch (error) {
    console.error("❌ Registration error:", error.response?.body || error);
    res.status(500).json({
      message: "Error during registration or sending verification email.",
      error: error.response?.body?.message || error.message,
    });
  }
};

/**
 * VERIFY OTP (Stage 2)
 * Confirms user OTP and saves to database.
 */
export const verifyEmail = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp)
      return res.status(400).json({ message: "Email and OTP required" });

    // 🔍 Check if this user exists in pendingUsers memory
    const pendingUser = pendingUsers.get(email);
    if (!pendingUser)
      return res
        .status(400)
        .json({ message: "No pendingUser verification found" });

    // 🔢 Compare OTP
    if (pendingUser.verificationCode !== otp.toString())
      return res.status(400).json({ message: "Invalid OTP" });

    // ⏰ Check expiration (10 minutes)
    if (Date.now() - pendingUser.createdAt > 10 * 60 * 1000)
      return res
        .status(400)
        .json({ message: "OTP expired, please register again" });

    // 🔎 Check if user already exists in the DB
    let user = await User.findOne({ email });

    if (user) {
      // ✅ If already exists, just update verification fields
      user.isVerified = true;
      user.verificationCode = null;
      await user.save();
    } else {
      // ✅ If not found (first registration), create the user and mark verified
      user = await User.create({
        fullName: pendingUser.fullName,
        email: pendingUser.email,
        password: pendingUser.hashedPassword,
        phone: pendingUser.phone,
        country: pendingUser.country,
        acceptedTerms: pendingUser.acceptedTerms,
        profilePhoto: pendingUser.profilePhoto,
        isVerified: true,
        verificationCode: null,
      });
    }

    // 🧹 Remove from pendingUser memory
    pendingUsers.delete(email);

    const fullName = user.fullName || pendingUser.fullName;

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; line-height:1.6;">
        <h2 style="color: green;">Welcome, ${fullName}👋</h2>
        <p>Congratulations for registering with <strong>Making a Difference Tech Hub (MDTH)</strong>, the future of Tech-Learning. Take a look at the next steps to start off your tech journey</p><br><br>
        <p>We’re excited to have you join our learning community — a platform built to equip you with relevant, up-to-date, and in-demand tech skills using standardized, industry-aligned curricula.

        Here, learning goes beyond theory. Our courses are carefully designed to help you gain practical, job-ready skills and real-world confidence in areas such as:</p>
        <ul>
        <li><strong>Web development</strong><li><br>
        <li><strong>Programming</strong><li><br>
        <li><strong>Artificial Intelligence (AI)</strong><li><br>
        <li><strong>Cybersecurity</strong><li><br>
        <li><strong>Data Analytics</strong><li><br>
        <li><strong>Graphic Design</strong><li><br>
        <li><strong>Video editing</strong><li><br>
        <li><strong>Project Management</strong><li><br>
        </ul><p> And a lot more!</p>
        <p>Each program is structured for clarity, depth, and measurable results, ensuring you learn what actually matters in today’s fast-changing tech industry.

        Whether you’re starting from scratch or advancing your career, you’re now part of a platform committed to:
        
        High-quality instruction
        
        Modern tools and technologies
        
        Structured learning paths
        
        Skills that translate into real outcomes
        
        Your journey starts now — explore your courses, stay consistent, and make the most of the resources available to you.
        
        We’re glad you’re here, and we look forward to seeing what you build 🚀
        
        Welcome aboard!</p>
      </div>
    `;

    const purpose = "Welcome";

    sendMail(purpose, email, htmlContent);

    // ✅ Response
    res.status(200).json({
      message:
        "✅ Email verification and registration successful! You can now log in.",
      user,
    });
  } catch (error) {
    console.error("❌ OTP verification error, User not registered", error);
    res.status(500).json({
      message: "OTP verification failed",
      error: error.message,
    });
  }
};

/* ---------------------------------------------
   📌 LOGIN
---------------------------------------------- */
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const correctPassword = await bcrypt.compare(password, user.password);
    if (!correctPassword)
      return res.status(401).json({ message: "Incorrect password" });

    if (!user.isVerified)
      return res.status(403).json({
        message: "Please verify your email before logging in.",
      });

    const token = jwt.sign(
      { id: user._id, role: user.role, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        role: user.role,
        email: user.email,
        photo: user.profilePhoto,
      },
    });
  } catch (error) {
    console.error("❌ Login error:", error);
    res.status(500).json({ message: "Login failed", error: error.message });
  }
};

// Verify token endpoint — used by frontend to validate JWT
export const verifyToken = async (req, res) => {
  try {
    // `authenticate` middleware attaches the user to req.user
    if (!req.user)
      return res.status(401).json({ message: "Not authenticated" });

    return res.status(200).json({
      message: "Token valid",
      user: {
        id: req.user._id,
        fullName: req.user.fullName,
        email: req.user.email,
        role: req.user.role,
        photo: req.user.profilePhoto,
      },
    });
  } catch (error) {
    console.error("❌ verifyToken error:", error);
    return res
      .status(500)
      .json({ message: "Token verification failed", error: error.message });
  }
};

/* ---------------------------------------------
   📌 GET ALL USERS
---------------------------------------------- */
// 📁 controllers/userController.js
// controllers/userController.js
// controllers/userController.js
export const getAllUsers = async (req, res) => {
  try {
    // ✅ Sort by creation date (newest first)
    const users = await User.find().select("-password").sort({ createdAt: -1 });

    res.status(200).json(users);
  } catch (error) {
    console.error("❌ Fetch users error:", error);
    res.status(500).json({
      message: "Error fetching users",
      error: error.message,
    });
  }
};

// 🗑 Delete user (Owner only)
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    await User.findByIdAndDelete(id);
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("❌ Delete user error:", error);
    res
      .status(500)
      .json({ message: "Failed to delete user", error: error.message });
  }
};

// ✏️ Edit user (Owner only)
export const updateUser = async (req, res) => {
  try {
    const { id } = req.user._id;
    const { fullName, email, role, phone } = req.body;

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.fullName = fullName || user.fullName;
    user.email = email || user.email;
    user.role = role || user.role;
    user.phone = phone || user.phone;

    await user.save();
    res.status(200).json({ message: "User updated successfully", user });
  } catch (error) {
    console.error("❌ Update user error:", error);
    res
      .status(500)
      .json({ message: "Failed to update user", error: error.message });
  }
};

export const getAllTutors = async (req, res) => {
  try {
    // 🚀 PRODUCTION QUERY: Fetch only users where the role is exactly "tutor"
    const tutors = await User.find({ role: "tutor" }).select(
      "fullName email phone country profilePhoto",
    );

    res.status(200).json({
      success: true,
      total: tutors.length,
      tutors, // The array now contains only the filtered coach objects
    });
  } catch (error) {
    console.error("❌ Error fetching tutors:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching tutors",
      error: error.message,
    });
  }
};

// update profile by student, coach and owner
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { fullName, phone, country, oldPassword, newPassword } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    /* -----------------------------------
       ✅ Update basic profile fields
    ----------------------------------- */
    if (fullName) user.fullName = fullName;
    if (phone) user.phone = phone;
    if (country) user.country = country;

    /* -----------------------------------
       🔐 PASSWORD UPDATE LOGIC
    ----------------------------------- */
    if (newPassword) {
      // Old password is required
      if (!oldPassword) {
        return res.status(400).json({
          message: "Old password is required to update password",
        });
      }

      // Compare old password
      const isMatch = await bcrypt.compare(oldPassword, user.password);
      if (!isMatch) {
        return res.status(401).json({
          message: "Old password is incorrect",
        });
      }

      // Validate new password
      if (newPassword.length < 5) {
        return res.status(400).json({
          message: "New password must be at least 5 characters long",
        });
      }

      // Hash and update password
      user.password = await bcrypt.hash(newPassword, 10);
    }

    /* -----------------------------------
       🖼 Profile photo update (Cloudinary)
    ----------------------------------- */
    if (req.file && req.file.buffer) {
      const uploadResult = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: "hgsc_users",
            transformation: [{ width: 500, height: 500, crop: "fill" }],
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          },
        );
        streamifier.createReadStream(req.file.buffer).pipe(stream);
      });

      user.profilePhoto = uploadResult.secure_url;
    }

    await user.save();

    /* -----------------------------------
       ✅ RESPONSE
    ----------------------------------- */
    res.status(200).json({
      message: "Profile updated successfully",
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        country: user.country,
        photo: user.profilePhoto,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("❌ Update profile error:", error);
    res.status(500).json({
      message: "Failed to update profile",
      error: error.message,
    });
  }
};

//get my profile
export const getUser = async (req, res) => {
  try {
    // Try using redis to cache db queries and reduce api response time for future queries
    const cached = await req.redisClient.get(`user:${id}`);
    if (cached) return res.status(200).json(JSON.parse(cached));
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await req.redisClient.setEx(`user:${id}`, 60, JSON.stringify(user));
    res.status(200).json({
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      country: user.country,
      photo: user.profilePhoto,
      role: user.role,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch profile" });
  }
};

// forgot password
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) return res.status(400).json({ message: "Email is required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "Email Does not Exist" });

    // 🔢 Generate 6-digit OTP
    const resetCode = generateOTP();

    // ⏰ Expires in 10 minutes
    user.resetPasswordCode = resetCode;
    user.resetPasswordExpires = Date.now() + 10 * 60 * 1000; //10 minutes

    await user.save();

    // ✉️ Email content

    const htmlContent = `
      <div style="font-family: Arial; line-height:1.6;">
        <h2>Password Reset Request 🔐</h2>
        <p>Hello ${user.fullName},</p>
        <p>Your password reset code is:</p>
        <h1 style="background:#0a7;color:#fff;padding:10px;border-radius:8px;justify-content:center;align-items:center;">
          ${resetCode}
        </h1>
        <p>This code expires in <b>10 minutes</b>.</p>
      </div>
    `;
    const purpose = "Password Reset";
    sendMail(purpose, email, htmlContent);

    res.status(200).json({
      message: "Password reset code sent to your email",
    });
  } catch (error) {
    console.error("❌ Forgot password error:", error);
    res.status(500).json({
      message: "Failed to send reset code",
      error: error.message,
    });
  }
};
// reset password

export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword)
      return res.status(400).json({ message: "All fields are required" });

    if (newPassword.length < 5)
      return res
        .status(400)
        .json({ message: "Password must be at least 5 characters" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    // ❌ OTP mismatch
    if (user.resetPasswordCode !== Number(otp))
      return res.status(400).json({ message: "Invalid reset code" });

    // ❌ OTP expired
    if (Date.now() > user.resetPasswordExpires)
      return res.status(400).json({ message: "Reset code expired" });

    // 🔐 Hash new password
    user.password = await bcrypt.hash(newPassword, 10);

    // 🧹 Clear reset fields
    user.resetPasswordCode = null;
    user.resetPasswordExpires = null;

    await user.save();

    res.status(200).json({
      message: "✅ Password reset successful. You can now log in.",
    });
  } catch (error) {
    console.error("❌ Reset password error:", error);
    res.status(500).json({
      message: "Password reset failed",
      error: error.message,
    });
  }
};
