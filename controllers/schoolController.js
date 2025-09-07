const {
  uploadFileToCloudinary,
  deleteFileFromCloudinary,
} = require("../config/cloudinary");
const School = require("../model/School");
const response = require("../utils/responceHandler");

const createSchool = async (req, res) => {
  try {
    const userId = req.user.userId;
    const file = req.file;
    let mediaUrl = null;
    let mediaType = null;
    if (file) {
      const uploadResult = await uploadFileToCloudinary(file);
      mediaUrl = uploadResult?.secure_url;
      mediaType = file.mimetype.startsWith("video") ? "video" : "image";
    }
    const {
      company,
      title,
      requirements,
      location,
      salary,
      email,
      mobile,
      schoolDescription,
    } = req.body;

    // Creating a new job with the logged-in user as owner
    const school = await School.create({
      user: userId,
      company,
      mediaUrl,
      mediaType,
      title,
      requirements,
      location,
      salary,
      email,
      mobile,
      schoolDescription,
    });
    return res.status(201).json({
      success: true,
      message: "School created successfully",
      school,
    });
  } catch (error) {
    console.error("Error creating School:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create School",
      error: error.message,
    });
  }
};

const deleteSchool = async (req, res) => {
  try {
    const school = await School.findOneAndDelete({
      _id: req.params.id,
      user: req.user.userId,
    });

    if (!school) {
      return res.status(404).json({
        success: false,
        message: "School not found or not authorized",
      });
    }

    if (school.mediaUrl) {
      try {
        const parts = school.mediaUrl.split("/");
        const filename = parts[parts.length - 1];
        const publicId = filename?.split(".")[0];

        if (publicId) {
          await deleteFileFromCloudinary(publicId);
        }
      } catch (err) {
        console.error("Cloudinary deletion failed:", err.message);
      }
    }

    return res.status(200).json({
      success: true,
      message: "School deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting School in controller:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete School",
      error: error.message,
    });
  }
};

const getAllSchools = async (req, res) => {
  try {
    const schools = await School.find()
      .sort({ createdAt: -1 })
      .populate("user", "_id username profilePicture");
    return response(res, 201, "Got Schools successfully", schools);
  } catch (error) {
    console.log("error getting Schools", error);
    return response(res, 500, "Internal server error", error.message);
  }
};

const updateSchool = async (req, res) => {
  try {
    const school = await School.findById(req.params.id);
    if (!school) {
      return response(res, 404, "School nahi mila");
    }
    if (school.user.toString() !== req.user.userId) {
      return response(res, 403, "You do not own this School post");
    }
    school.title = req.body.content.title || school.title;
    school.requirements = req.body.content.requirements || school.requirements;
    school.location = req.body.content.location || school.location;
    school.salary = req.body.content.salary || school.salary;
    school.email = req.body.content.email || school.email;
    school.mobile = req.body.content.mobile || school.mobile;
    school.schoolDescription =
      req.body.content.schoolDescription || school.schoolDescription;
    await school.save();
    return response(res, 200, "School post updated", school);
  } catch (error) {
    console.error("Error updating school in controller:", error);
    return response(res, 500, "Something went wrong in controller");
  }
};

module.exports = {
  createSchool,
  deleteSchool,
  getAllSchools,
  updateSchool,
};
