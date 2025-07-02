import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    await mongoose.connect('mongodb+srv://TarunjGupta:242512@cluster0.utfevx3.mongodb.net/Food-del');
    console.log("DB Connected");
  } catch (err) {
    console.error("DB Connection Error:", err);
  }
};
