import mongoose from 'mongoose';

const teamMemberSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    position: {
      type: String,
      required: true,
      trim: true,
    },
    photoUrl: {
      type: String,
    },
    photoFilePath: {
      type: String,
    },
    cloudinaryPublicId: {
      type: String,
    },
    socialLinks: {
      facebook: { type: String, default: '' },
      instagram: { type: String, default: '' },
      linkedin: { type: String, default: '' },
      whatsapp: { type: String, default: '' },
    },
  },
  { timestamps: true, versionKey: false },
);

export default mongoose.model('TeamMember', teamMemberSchema);
