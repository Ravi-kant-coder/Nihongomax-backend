const { uploadFileToCloudinary } = require("../config/cloudinary");
const User = require("../model/User");
const { generateToken } = require("../utils/generateToken");
const response = require("../utils/responceHandler");
const bcrypt = require("bcryptjs");

const registerUser = async (req, res) => {
  try {
    console.log("controller req.body:", req.body);
    console.log("controller req.file:", req.file); // multer puts file here

    const { username, email, password } = req.body;

    // check the existing user with email
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return response(res, 400, "This email already exists");
    }

    let profilePicture = "";

    // if file exists, upload to cloudinary
    if (req.file) {
      const uploadResult = await uploadFileToCloudinary(req.file);
      profilePicture = uploadResult?.secure_url;
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // create new user
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      profilePicture, // store cloudinary URL
    });

    await newUser.save();

    // generate JWT
    const accessToken = generateToken(newUser);

    res.cookie("auth_token", accessToken, {
      httpOnly: true,
      sameSite: "none",
      secure: true,
    });

    return response(res, 201, "Account created successfully", {
      username: newUser.username,
      email: newUser.email,
      profilePicture: profilePicture,
    });
  } catch (error) {
    console.error("Register error:", error);
    return response(res, 500, "Internal Server Error", error.message);
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    //  check the existing user with email
    const user = await User.findOne({ email });
    if (!user) {
      return response(res, 404, "User not found with this email");
    }

    const matchPassword = await bcrypt.compare(password, user.password);
    if (!matchPassword) {
      return response(res, 404, "Invalid Password");
    }

    const accessToken = generateToken(user);

    res.cookie("auth_token", accessToken, {
      httpOnly: true,
      sameSite: "none",
      secure: true,
    });

    return response(res, 201, "Logged in successfully", {
      username: user.username,
      email: user.email,
    });
  } catch (error) {
    console.error(error);
    return response(res, 500, "Internal Server Error", error.message);
  }
};

const logout = (req, res) => {
  try {
    res.cookie("auth_token", "", {
      httpOnly: true,
      sameSite: "none",
      secure: true,
      expires: new Date(0),
    });
    return response(res, 200, "Logged out successfully");
  } catch (error) {
    console.error(error);
    return response(res, 500, "Internal Server Error", error.message);
  }
};

module.exports = { registerUser, loginUser, logout };
