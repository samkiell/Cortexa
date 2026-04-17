import { Schema, model, models } from 'mongoose';

const UserSchema = new Schema(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      index: true,
    },
    password: {
      type: String,
    },
    name: {
      type: String,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    selectedModel: {
      type: String,
      default: 'huihui-ai/Llama-3.3-70B-Instruct-abliterated',
    },
    avatarUrl: {
      type: String,
    },
    suspended: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const User = models.User || model('User', UserSchema);

export default User;
