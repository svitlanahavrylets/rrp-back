import Service from '../models/serviceModel.js';

export const getAllServices = async () => {
  return await Service.find().sort({ createdAt: -1 });
};

export const getServiceById = async (id) => {
  const service = await Service.findById(id);
  return service;
};

export const createService = async (data) => {
  const service = new Service(data);
  return await service.save();
};

export const updateService = async (id, data) => {
  const updated = await Service.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
  return updated;
};

export const deleteService = async (id) => {
  const deleted = await Service.findByIdAndDelete(id);
  return deleted;
};
