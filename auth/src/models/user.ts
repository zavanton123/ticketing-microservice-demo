import mongoose from 'mongoose';
import {Password} from "../services/password";

interface UserAttrs {
  email: string;
  password: string;
}

interface UserModel extends mongoose.Model<any> {
  build(attrs: UserAttrs): any;
}

interface UserDoc extends mongoose.Document {
  email: string;
  password: string;
}

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  }
}, {
  // we transform how the User will be presented
  // (i.e. res.send(user))
  toJSON: {
    transform(doc, ret) {
      // replace _id by id
      ret.id = ret._id;
      delete ret._id;
      // don't show the password field
      delete ret.password;
      // don't show the __v field
      delete ret.__v;
    }
  }
});

// before saving a User,
// replace its plain text password by the hashed password
userSchema.pre('save', async function (done) {
  if (this.isModified('password')) {
    const hashed = await Password.toHash(this.get('password'));
    this.set('password', hashed);
  }
  done();
});

// this factory function makes it possible to enforce typescript type checks
userSchema.statics.build = (attrs: UserAttrs) => {
  return new User(attrs);
}

const User = mongoose.model<UserDoc, UserModel>('User', userSchema);

export {User};
