import mongoose from "mongoose";
import bcrypt from "bcrypt";

const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: {
    type: String,
    enum: ["teacher", "student"],
  },
});

// UserSchema.pre("save", async function () {
//   if (!this.isModified("password") || !this.password) return; // this ensures that password always exist before reaching to the hasing portion 
//   this.password = await bcrypt.hash(this.password, 10);
// });

export const User = mongoose.model("User", UserSchema);
