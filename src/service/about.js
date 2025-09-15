import About from '../models/aboutModel.js';

export const getAbout = async () => {
  const about = await About.findOne();
  return about;
};

export const createOrUpdateAbout = async (data) => {
  const existing = await About.findOne();

  if (existing) {
    if (!data.imageUrl) {
      data.imageUrl = existing.imageUrl;
    }
    Object.assign(existing, data);
    return await existing.save();
  } else {
    if (!data.imageUrl) {
      throw new Error('Je vyžadována fotografie');
    }
    const newAbout = new About(data);
    return await newAbout.save();
  }
};

export const deleteAbout = async () => {
  const existing = await About.findOne();
  if (!existing) {
    throw new Error('Žádné informace k odstranění');
  }

  await About.findByIdAndDelete(existing._id);
  return { message: 'Informace byly úspěšně odstraněny' };
};
