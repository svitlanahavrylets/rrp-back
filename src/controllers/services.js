import createHttpError from 'http-errors';
import * as serviceServices from '../service/services.js';

export const getServicesController = async (req, res) => {
  const services = await serviceServices.getAllServices();
  res.json({
    status: 200,
    message: 'Úspěšně načtené služby',
    data: services,
  });
};

export const getServiceByIdController = async (req, res) => {
  const { id } = req.params;

  const service = await serviceServices.getServiceById(id);
  if (!service) {
    throw createHttpError(404, `Služba s ID ${id} nebyla nalezena`);
  }
  res.status(200).json({
    status: 200,
    message: 'Služba byla úspěšně načtena',
    data: service,
  });
};

export const createServiceController = async (req, res) => {
  const data = req.body;
  const service = await serviceServices.createService(data);
  res
    .status(201)
    .json({ status: 201, message: 'Služba byla vytvořena', data: service });
};

export const updateServiceController = async (req, res) => {
  const { id } = req.params;

  const data = req.body;
  const updated = await serviceServices.updateService(id, data);
  if (!updated) throw createHttpError(404, `Služba s ID ${id} nebyla nalezena`);
  res.json({
    status: 200,
    message: 'Služba byla aktualizována',
    data: updated,
  });
};

export const deleteServiceController = async (req, res) => {
  const { id } = req.params;

  const deleted = await serviceServices.deleteService(id);
  if (!deleted) throw createHttpError(404, `Služba s ID ${id} nebyla nalezena`);
  res.status(204).send();
};
