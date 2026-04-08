import mongoose, { Schema, model, models } from 'mongoose';

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
  },
  { timestamps: true }
);

const Settings = models.Settings || model('Settings', SettingsSchema);

export default Settings;
