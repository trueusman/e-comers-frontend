import mongoose, { Schema, Document, models } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser extends Document {
  name: string;
  email: string;
  phone: string;
  password: string;
  city: string;
  avatar: string;
  role: "user" | "admin";
  matchPassword(password: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    name:     { type: String, required: true, trim: true },
    email:    { type: String, required: true, unique: true, lowercase: true },
    phone:    { type: String, required: true },
    password: { type: String, required: true, minlength: 6, select: false },
    city:     { type: String, default: "" },
    avatar:   { type: String, default: "" },
    role:     { type: String, enum: ["user", "admin"], default: "user" },
  },
  { timestamps: true }
);

UserSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

UserSchema.methods.matchPassword = async function (entered: string) {
  return bcrypt.compare(entered, this.password);
};

const User = models.User || mongoose.model<IUser>("User", UserSchema);
export default User;
