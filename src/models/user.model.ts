import bcrypt from "bcrypt";
import { model, Schema } from "mongoose";
import { UserDocument, UserModel } from "../types/user.type.js";

const userSchema = new Schema<UserDocument, UserModel>(
  {
    username: {
      type: String,
      required: [true, "Please provide your username!"],
      unique: true,
    },
    email: {
      type: String,
      required: [true, "Please provide your email"],
      unique: true,
      match: [/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g, "Please provide a valid email address"],
    },
    password: {
      type: String,
      select: false,
      required: [true, "Please provide a password"],
      minlength: 8,
    },
    workflow: [
      {
        type: Schema.Types.ObjectId,
        ref: "Workflow",
      },
    ],
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password!, +process.env.SALT_ROUNDS!);

  next();
});

// userSchema.pre(/^find/, function (next) {
//   if (this instanceof Query) this.select("-__v");
//   next();
// });

userSchema.methods.checkPassword = async function (password: string) {
  return await bcrypt.compare(password, this.password);
};

export default model<UserDocument, UserModel>("User", userSchema);
