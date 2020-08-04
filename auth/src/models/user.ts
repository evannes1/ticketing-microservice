import mongoose from "mongoose";
import { Password } from "../services/password";

// An interface that describes the properties required to create a
//  new user.
interface UserAttrs {
  email: string;
  password: string;
}

// An interface that describes the properties that the User Model has; ie we
//  need to tell TypeScript about the "build" method; the build method
//  returns an instance of UserDoc.
interface UserModel extends mongoose.Model<UserDoc> {
  build(attrs: UserAttrs): UserDoc;
}

// An interface that describes the properties that the User Document has -- a single user
interface UserDoc extends mongoose.Document {
  email: string;
  password: string;
}

// define mongo schema
const userSchema = new mongoose.Schema(
  {
    email: {
      type: String, //mongoose typing
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  {
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.password; //--> we don't want to send back the password
        delete ret.__v;
      },
    },
  }
);

userSchema.pre("save", async function (done) {
  if (this.isModified("password")) {
    const hashed = await Password.toHash(this.get("password"));
    this.set("password", hashed);
  }
  done();
});

userSchema.statics.build = (attrs: UserAttrs) => {
  return new User(attrs); // this returns a User document
};

const User = mongoose.model<UserDoc, UserModel>("User", userSchema);

export { User };
