import { Schema, model, models } from 'mongoose';

const SettingsSchema = new Schema(
  {
    featherlessApiKey: {
      type: String,
      default: '',
    },
    visibleModels: {
      type: [String],
      default: [],
    },
    siteName: {
      type: String,
      default: 'Cortexa',
    },
    allowRegistration: {
      type: Boolean,
      default: true,
    },
    maxConversations: {
      type: Number,
      default: 10,
    },
    hourlyMessageLimit: {
      type: Number,
      default: 30,
    },
    hourlyConversationLimit: {
      type: Number,
      default: 10,
    },
    maintenanceMode: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Settings = models.Settings || model('Settings', SettingsSchema);

export default Settings;
