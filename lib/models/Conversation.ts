import { Schema, model, models } from 'mongoose';

const MessageSchema = new Schema(
  {
    role: {
      type: String,
      enum: ['user', 'assistant'],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    imageUrl: {
      type: String,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const ConversationSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      default: 'New Chat',
    },
    modelId: {
      type: String,
      required: true,
    },
    messages: [MessageSchema],
  },
  { timestamps: true }
);

const Conversation = models.Conversation || model('Conversation', ConversationSchema);

export default Conversation;
