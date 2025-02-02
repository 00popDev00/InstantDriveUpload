import mongoose from "mongoose";

const ImageSchema = new mongoose.Schema({
  userEmail: String,
  fileName: String,
  googleDriveLink: String,
  uploadedAt: { type: Date, default: Date.now },
});

export default mongoose.models.Image || mongoose.model("Image", ImageSchema);
