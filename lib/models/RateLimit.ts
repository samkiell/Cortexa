import { Schema, model, models } from 'mongoose';

const RateLimitSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    count: {
      type: Number,
      default: 0,
    },
    type: {
      type: String,
      enum: ['chat', 'conversation'],
      default: 'chat',
      index: true,
    },
    windowStart: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// TTL index to automatically clean up rate limit docs after an hour if needed,
// though we handle it in code as well.
RateLimitSchema.index({ updatedAt: 1 }, { expireAfterSeconds: 3600 });

const RateLimit = models.RateLimit || model('RateLimit', RateLimitSchema);

export default RateLimit;
