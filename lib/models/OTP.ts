import { Schema, model, models } from 'mongoose';

const OTPSchema = new Schema(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      index: true,
    },
    code: {
      type: String,
      required: [true, 'OTP code is required'],
    },
    expiresAt: {
      type: Date,
      required: [true, 'Expiration time is required'],
      expires: 0, // TTL index
    },
    used: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const OTP = models.OTP || model('OTP', OTPSchema);

export default OTP;
