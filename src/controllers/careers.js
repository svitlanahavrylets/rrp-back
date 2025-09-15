import createHttpError from 'http-errors';
import * as careerServices from '../service/careers.js';

export const getCareersController = async (req, res) => {
  const careers = await careerServices.getAllCareers();
  res.status(200).json({
    status: 200,
    message: 'Úspěšně načtené pracovní pozice',
    data: careers,
  });
};

export const getCareerByIdController = async (req, res) => {
  const { id } = req.params;

  const career = await careerServices.getCareerById(id);
  if (!career) {
    throw createHttpError(404, `Pracovní pozice s ID ${id} nebyla nalezena`);
  }
  res.status(200).json({
    status: 200,
    message: 'Pracovní pozice byla úspěšně načtena',
    data: career,
  });
};

export const createCareerController = async (req, res) => {
  const data = req.body;
  const career = await careerServices.createCareer(data);
  res.status(201).json({
    status: 201,
    message: 'Pracovní pozice byla vytvořena',
    data: career,
  });
};

export const updateCareerController = async (req, res) => {
  const { id } = req.params;

  const data = req.body;
  const updated = await careerServices.updateCareer(id, data);
  if (!updated)
    throw createHttpError(404, `Pracovní pozice s ID ${id} nebyla nalezena`);
  res.status(200).json({
    status: 200,
    message: 'Pracovní pozice byla aktualizována',
    data: updated,
  });
};

export const deleteCareerController = async (req, res) => {
  const { id } = req.params;

  const deleted = await careerServices.deleteCareer(id);
  if (!deleted)
    throw createHttpError(404, `Pracovní pozice s ID ${id} nebyla nalezena`);
  res.status(204).send();
};
