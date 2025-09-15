import createHttpError from 'http-errors';
import * as aboutServices from '../service/about.js';

export const getAboutController = async (req, res) => {
  const data = await aboutServices.getAbout();

  if (!data) {
    throw createHttpError(404, 'Informace o stránce nebyly nalezeny');
  }

  res.json({
    status: 200,
    message: 'Informace o stránce byly úspěšně načteny',
    data,
  });
};

export const createOrUpdateAboutController = async (req, res) => {
  const data = await aboutServices.createOrUpdateAbout(req.body);
  if (!data) {
    throw createHttpError(404, 'Je vyžadována fotografie');
  }
  res.status(201).json({
    status: 201,
    message: 'Informace o stránce byly úspěšně vytvořeny nebo aktualizovány',
    data,
  });
};

export const deleteAboutController = async (req, res) => {
  const result = await aboutServices.deleteAbout();

  if (!result) throw createHttpError(404, 'Informace nebyly nalezeny');

  res.status(204).send();
};
