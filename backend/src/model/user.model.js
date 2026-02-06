import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// USER SCHEMA
const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      // unique: true, // ✅ Best Practice: Ensure uniqueness
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    role: {
      type: String,
      enum: ["user", "admin", "vendor"], // ✅ Add roles for scalability
      default: "user",
    },
    phone: {
      type: String,
      // required: true,
      // match: /^[0-9]{10}$/, // ✅ Optional validation
    },
    address: {
      type: String,
    },
    refreshToken: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);


//  Hash Password Before Save
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});


//  Instance Method: Compare Password
userSchema.methods.checkPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};


//  Instance Method: Generate Access Token
userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      id: this._id,
      email: this.email,
      role: this.role,
    },

    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRESIN || "1d" }
  );
};


//  Instance Method: Generate Refresh Token
userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET, 
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRESIN || "7d" }
  );
};


// Export Model
export const User = mongoose.model("User", userSchema);
