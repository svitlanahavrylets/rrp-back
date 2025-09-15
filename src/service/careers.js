import Career from '../models/careersModel.js';

export const getAllCareers = async () => {
  return await Career.find().sort({ createdAt: -1 });
};

export const getCareerById = async (id) => {
  const career = await Career.findById(id);
  return career;
};

export const createCareer = async (data) => {
  const career = new Career(data);
  return await career.save();
};

export const updateCareer = async (id, data) => {
  const updated = await Career.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
  return updated;
};

export const deleteCareer = async (id) => {
  const deleted = await Career.findByIdAndDelete(id);
  return deleted;
};
