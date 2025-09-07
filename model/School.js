const mongoose = require("mongoose");

const schoolSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    company: { type: String, required: true },
    mediaUrl: { type: String },
    mediaType: { type: String, enum: ["image", "video"] },
    title: { type: String, required: true },
    requirements: { type: String },
    location: { type: String, required: true },
    salary: { type: String, required: true },
    email: { type: String, required: true },
    mobile: { type: String, required: true },
    schoolDescription: {
      type: String,
      required: true,
      maxlength: 5000,
      minlength: 10,
    },
  },
  { timestamps: true }
);

const School = mongoose.model("School", schoolSchema);
module.exports = School;
