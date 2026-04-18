import { Schema, model, models } from 'mongoose';

const SupportTicketSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    userEmail: {
      type: String,
      required: true,
    },
    subject: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['open', 'in-progress', 'resolved', 'closed'],
      default: 'open',
    },
    adminResponse: {
      type: String,
    },
  },
  { timestamps: true }
);

const SupportTicket = models.SupportTicket || model('SupportTicket', SupportTicketSchema);

export default SupportTicket;
