import mongoose from 'mongoose';

const aboutSchema = new mongoose.Schema(
  {
    imageUrl: {
      type: String,

      trim: true,
    },
    cloudinaryPublicId: {
      type: String,
      trim: true,
    },
    text: {
      type: String,
      trim: true,
    },
    youtubeLink: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true, versionKey: false },
);

export default mongoose.model('About', aboutSchema);
