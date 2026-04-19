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
    globalSystemPrompt: {
      type: String,
      default: '',
    },
    modelPricing: {
      type: Map,
      of: new Schema({
        pricePer1kTokens: { type: Number, default: 0 },
      }, { _id: false }),
      default: {},
    },
  },
  { timestamps: true }
);

const Settings = models.Settings || model('Settings', SettingsSchema);

export default Settings;
